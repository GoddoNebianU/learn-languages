import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const USERNAME = process.argv[2] ?? "goddonebianu";
  const user = await prisma.user.findFirst({ where: { username: USERNAME } });
  if (!user) {
    console.log(`User "${USERNAME}" not found`);
    return;
  }
  const courses = await prisma.course.findMany({
    where: { userId: user.id },
    include: {
      chapters: {
        orderBy: { sortOrder: "asc" },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      },
    },
    orderBy: { id: "asc" },
  });
  console.log(`User: ${user.username} (id=${user.id})`);
  console.log(`Courses: ${courses.length}\n`);
  let totalChapters = 0;
  let totalItems = 0;
  for (const c of courses) {
    const itemCount = c.chapters.reduce((acc, ch) => acc + ch.items.length, 0);
    totalChapters += c.chapters.length;
    totalItems += itemCount;
    console.log(`Course id=${c.id}: "${c.title}"`);
    console.log(`  lang=${c.language} learner=${c.learnerLanguage} visibility=${c.visibility}`);
    console.log(`  ${c.chapters.length} chapters, ${itemCount} items`);
    // sanity-check the first item has all 5 sections
    const firstItem = c.chapters[0]?.items[0];
    if (firstItem) {
      const content = firstItem.content as Record<string, unknown>;
      const sections = ["article", "dialogue", "vocabulary", "grammar", "exercises"].filter(
        (k) => content[k] !== undefined,
      );
      console.log(`  first item type=${firstItem.type} sections=[${sections.join(",")}]`);
    }
    console.log();
  }
  console.log(`TOTAL: ${courses.length} courses, ${totalChapters} chapters, ${totalItems} items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
