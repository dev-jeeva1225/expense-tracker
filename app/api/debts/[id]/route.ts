import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { debtTag } from "@/lib/data";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const debt = await prisma.debtRecord.findUnique({ where: { id: params.id } });
  if (!debt || debt.userId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.debtRecord.update({
    where: { id: params.id },
    data: { settled: true },
  });

  revalidateTag(debtTag(session.user.id));
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const debt = await prisma.debtRecord.findUnique({ where: { id: params.id } });
  if (!debt || debt.userId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.debtRecord.delete({ where: { id: params.id } });
  revalidateTag(debtTag(session.user.id));
  return NextResponse.json({ ok: true });
}
