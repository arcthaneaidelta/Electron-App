import { Router } from "express";
import { db } from "@workspace/db";
import { historyTable } from "@workspace/db";
import { eq, like, and, count, desc, sql } from "drizzle-orm";
import { ListHistoryQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const params = ListHistoryQueryParams.safeParse(req.query);
    const { page = 1, limit = 20, search, type, status } = params.success ? params.data : {};

    const safePage = Math.max(1, page ?? 1);
    const safeLimit = Math.min(100, limit ?? 20);
    const offset = (safePage - 1) * safeLimit;

    const conditions = [];
    if (status) conditions.push(eq(historyTable.status, status as "success" | "error" | "warning"));
    if (type) conditions.push(eq(historyTable.type, type));
    if (search) conditions.push(like(historyTable.commandName, `%${search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(historyTable)
      .where(whereClause);

    const total = totalResult?.count ?? 0;
    const totalPages = Math.ceil(total / safeLimit);

    const entries = await db
      .select()
      .from(historyTable)
      .where(whereClause)
      .orderBy(desc(historyTable.timestamp))
      .limit(safeLimit)
      .offset(offset);

    res.json({
      entries: entries.map((e) => ({
        ...e,
        id: String(e.id),
        commandId: e.commandId ? String(e.commandId) : undefined,
        timestamp: e.timestamp.toISOString(),
      })),
      total,
      page: safePage,
      totalPages,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list history");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const [totalResult] = await db.select({ count: count() }).from(historyTable);
    const [successResult] = await db
      .select({ count: count() })
      .from(historyTable)
      .where(eq(historyTable.status, "success"));
    const [errorResult] = await db
      .select({ count: count() })
      .from(historyTable)
      .where(eq(historyTable.status, "error"));
    const [warningResult] = await db
      .select({ count: count() })
      .from(historyTable)
      .where(eq(historyTable.status, "warning"));

    const mostUsedResult = await db
      .select({
        commandName: historyTable.commandName,
        count: count(),
      })
      .from(historyTable)
      .groupBy(historyTable.commandName)
      .orderBy(sql`count(*) DESC`)
      .limit(1);

    res.json({
      totalExecutions: totalResult?.count ?? 0,
      successCount: successResult?.count ?? 0,
      errorCount: errorResult?.count ?? 0,
      warningCount: warningResult?.count ?? 0,
      mostUsedCommand: mostUsedResult[0]?.commandName ?? "None",
      peakHour: "14:00 - 15:00",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get history summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
