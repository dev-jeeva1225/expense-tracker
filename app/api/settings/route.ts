import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { name, currentPassword, newPassword } = parsed.data;

  if (newPassword) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const valid = currentPassword ? await bcrypt.compare(currentPassword, user.passwordHash) : false;
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  const data: { name?: string; passwordHash?: string } = {};
  if (name) data.name = name;
  if (newPassword) data.passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({ where: { id: session.user.id }, data });
  return NextResponse.json({ ok: true });
}
