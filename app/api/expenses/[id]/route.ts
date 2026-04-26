import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { expenseTag } from "@/lib/data";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expense = await prisma.expense.findUnique({ where: { id: params.id } });
  if (!expense || expense.userId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.expense.delete({ where: { id: params.id } });
  revalidateTag(expenseTag(session.user.id));
  return NextResponse.json({ ok: true });
}
