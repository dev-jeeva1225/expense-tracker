import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { debtTag } from "@/lib/data";
import { z } from "zod";

const createSchema = z.object({
  counterparty: z.string().min(1),
  amount: z.number().positive(),
  direction: z.enum(["I_OWE", "OWED_TO_ME"]),
  note: z.string().optional(),
  date: z.string(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const showSettled = req.nextUrl.searchParams.get("settled") === "true";

  const debts = await prisma.debtRecord.findMany({
    where: {
      userId: session.user.id,
      ...(showSettled ? {} : { settled: false }),
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ debts });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const debt = await prisma.debtRecord.create({
    data: {
      userId: session.user.id,
      counterparty: parsed.data.counterparty,
      amount: parsed.data.amount,
      direction: parsed.data.direction,
      note: parsed.data.note,
      date: new Date(parsed.data.date),
    },
  });

  revalidateTag(debtTag(session.user.id));
  return NextResponse.json(debt, { status: 201 });
}
