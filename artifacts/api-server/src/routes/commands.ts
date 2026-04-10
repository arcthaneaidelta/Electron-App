import { Router } from "express";
import { db } from "@workspace/db";
import { commandsTable, historyTable } from "@workspace/db";
import { eq, like, and, sql } from "drizzle-orm";
import {
  CreateCommandBody,
  UpdateCommandBody,
  ListCommandsQueryParams,
  GetCommandParams,
  UpdateCommandParams,
  DeleteCommandParams,
  ExecuteCommandParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const params = ListCommandsQueryParams.safeParse(req.query);
    const { category, search } = params.success ? params.data : {};

    const conditions = [];
    if (category) conditions.push(eq(commandsTable.category, category));
    if (search) conditions.push(like(commandsTable.name, `%${search}%`));

    const commands = await db
      .select()
      .from(commandsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    res.json(
      commands.map((c) => ({
        id: String(c.id),
        name: c.name,
        description: c.description,
        category: c.category,
        trigger: c.trigger,
        script: c.script,
        shortcut: c.shortcut,
        status: c.status,
        executionCount: c.executionCount,
        lastExecuted: c.lastExecuted?.toISOString(),
        avgExecutionTime: c.avgExecutionTime ?? 0,
        tags: c.tags ?? [],
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list commands");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateCommandBody.parse(req.body);
    const [command] = await db
      .insert(commandsTable)
      .values({
        name: body.name,
        description: body.description,
        category: body.category,
        trigger: body.trigger,
        script: body.script,
        shortcut: body.shortcut,
        tags: body.tags ?? [],
        status: "active",
      })
      .returning();

    res.status(201).json({
      ...command,
      id: String(command.id),
      lastExecuted: command.lastExecuted?.toISOString(),
      createdAt: command.createdAt.toISOString(),
      updatedAt: command.updatedAt.toISOString(),
      tags: command.tags ?? [],
      avgExecutionTime: command.avgExecutionTime ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create command");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = GetCommandParams.parse(req.params);
    const [command] = await db
      .select()
      .from(commandsTable)
      .where(eq(commandsTable.id, parseInt(id)));

    if (!command) return res.status(404).json({ error: "Command not found" });

    res.json({
      ...command,
      id: String(command.id),
      lastExecuted: command.lastExecuted?.toISOString(),
      createdAt: command.createdAt.toISOString(),
      updatedAt: command.updatedAt.toISOString(),
      tags: command.tags ?? [],
      avgExecutionTime: command.avgExecutionTime ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get command");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = UpdateCommandParams.parse(req.params);
    const body = UpdateCommandBody.parse(req.body);

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.trigger !== undefined) updateData.trigger = body.trigger;
    if (body.script !== undefined) updateData.script = body.script;
    if (body.shortcut !== undefined) updateData.shortcut = body.shortcut;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.tags !== undefined) updateData.tags = body.tags;

    const [command] = await db
      .update(commandsTable)
      .set(updateData)
      .where(eq(commandsTable.id, parseInt(id)))
      .returning();

    if (!command) return res.status(404).json({ error: "Command not found" });

    res.json({
      ...command,
      id: String(command.id),
      lastExecuted: command.lastExecuted?.toISOString(),
      createdAt: command.createdAt.toISOString(),
      updatedAt: command.updatedAt.toISOString(),
      tags: command.tags ?? [],
      avgExecutionTime: command.avgExecutionTime ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update command");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = DeleteCommandParams.parse(req.params);
    await db.delete(commandsTable).where(eq(commandsTable.id, parseInt(id)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete command");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/execute", async (req, res) => {
  try {
    const { id } = ExecuteCommandParams.parse(req.params);
    const [command] = await db
      .select()
      .from(commandsTable)
      .where(eq(commandsTable.id, parseInt(id)));

    if (!command) return res.status(404).json({ error: "Command not found" });

    const executionTime = Math.random() * 800 + 50;
    const success = Math.random() > 0.1;
    const now = new Date();

    await db.insert(historyTable).values({
      commandId: command.id,
      commandName: command.name,
      type: "command_executed",
      status: success ? "success" : "error",
      output: success ? `Command "${command.name}" executed successfully.` : undefined,
      error: !success ? `Execution failed for "${command.name}"` : undefined,
      executionTime: Math.round(executionTime),
      triggeredBy: "manual",
      timestamp: now,
    });

    await db
      .update(commandsTable)
      .set({
        executionCount: sql`${commandsTable.executionCount} + 1`,
        lastExecuted: now,
        avgExecutionTime: sql`(${commandsTable.avgExecutionTime} * ${commandsTable.executionCount} + ${Math.round(executionTime)}) / (${commandsTable.executionCount} + 1)`,
        updatedAt: now,
      })
      .where(eq(commandsTable.id, parseInt(id)));

    const historyId = String(Date.now());
    res.json({
      id: historyId,
      commandId: id,
      status: success ? "success" : "error",
      output: success ? `Command "${command.name}" executed successfully.` : undefined,
      error: !success ? `Execution failed for "${command.name}"` : undefined,
      executionTime: Math.round(executionTime),
      executedAt: now.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to execute command");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
