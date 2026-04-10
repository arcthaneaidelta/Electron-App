import { Router } from "express";
import { db } from "@workspace/db";
import { commandsTable, historyTable } from "@workspace/db";
import { count, eq, gte, sql, desc } from "drizzle-orm";

const router = Router();

router.get("/stats", async (req, res) => {
  try {
    const [totalCommandsResult] = await db.select({ count: count() }).from(commandsTable);
    const totalCommands = totalCommandsResult?.count ?? 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [executionsTodayResult] = await db
      .select({ count: count() })
      .from(historyTable)
      .where(gte(historyTable.timestamp, today));
    const executionsToday = executionsTodayResult?.count ?? 0;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const [executionsWeekResult] = await db
      .select({ count: count() })
      .from(historyTable)
      .where(gte(historyTable.timestamp, weekAgo));
    const executionsThisWeek = executionsWeekResult?.count ?? 0;

    const [successResult] = await db
      .select({ count: count() })
      .from(historyTable)
      .where(eq(historyTable.status, "success"));
    const [totalHistoryResult] = await db.select({ count: count() }).from(historyTable);
    const totalHistory = totalHistoryResult?.count ?? 0;
    const successCount = successResult?.count ?? 0;
    const successRate = totalHistory > 0 ? Math.round((successCount / totalHistory) * 100) : 100;

    const [avgTimeResult] = await db
      .select({ avg: sql<number>`AVG(${historyTable.executionTime})` })
      .from(historyTable);
    const avgExecutionTime = Math.round((avgTimeResult?.avg ?? 0) * 10) / 10;

    const [activeWorkflowsResult] = await db
      .select({ count: count() })
      .from(commandsTable)
      .where(eq(commandsTable.status, "active"));
    const activeWorkflows = activeWorkflowsResult?.count ?? 0;

    res.json({
      totalCommands,
      executionsToday,
      executionsThisWeek,
      successRate,
      avgExecutionTime,
      activeWorkflows,
      clipboardItems: 47,
      uptime: "99.8%",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/activity", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const entries = await db
      .select()
      .from(historyTable)
      .orderBy(desc(historyTable.timestamp))
      .limit(limit);

    const activity = entries.map((e) => ({
      id: String(e.id),
      type: e.type,
      title: e.commandName ? `Executed: ${e.commandName}` : "System event",
      description: e.output?.substring(0, 100) || e.error?.substring(0, 100) || "",
      status: e.status,
      timestamp: e.timestamp.toISOString(),
      commandId: e.commandId ? String(e.commandId) : undefined,
    }));

    res.json(activity);
  } catch (err) {
    req.log.error({ err }, "Failed to get activity");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/chart-data", async (req, res) => {
  try {
    const days = 14;
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [executionsResult] = await db
        .select({ count: count() })
        .from(historyTable)
        .where(
          sql`${historyTable.timestamp} >= ${date} AND ${historyTable.timestamp} < ${nextDate}`
        );

      const [errorsResult] = await db
        .select({ count: count() })
        .from(historyTable)
        .where(
          sql`${historyTable.timestamp} >= ${date} AND ${historyTable.timestamp} < ${nextDate} AND ${historyTable.status} = 'error'`
        );

      const [avgResult] = await db
        .select({ avg: sql<number>`AVG(${historyTable.executionTime})` })
        .from(historyTable)
        .where(
          sql`${historyTable.timestamp} >= ${date} AND ${historyTable.timestamp} < ${nextDate}`
        );

      result.push({
        date: date.toISOString().split("T")[0],
        executions: executionsResult?.count ?? 0,
        errors: errorsResult?.count ?? 0,
        avgTime: Math.round((avgResult?.avg ?? 0) * 10) / 10,
      });
    }

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get chart data");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
