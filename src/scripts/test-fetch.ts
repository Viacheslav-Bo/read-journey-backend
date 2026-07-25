// src/scripts/test-fetch.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Тягнемо книгу з Open Library
  const response = await fetch(
    'https://openlibrary.org/search.json?q=harry+potter&limit=1',
  );
  const data = await response.json();
  const book = data.docs[0];

  console.log('Отримано з Open Library:', book.title, book.author_name?.[0]);

  // 2. Створюємо тестового юзера (для FK, бо LibraryBook прив'язаний до userId)
  const user = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'test@test.com',
      password: 'dummy', //<------- тут поки без хешування, це просто тест
    },
  });

  // 3. Записуємо книгу в LibraryBook
  const savedBook = await prisma.libraryBook.create({
    data: {
      userId: user.id,
      openLibraryId: book.key,
      title: book.title,
      author: book.author_name?.[0] ?? 'Unknown',
      coverUrl: book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : null,
      totalPages: book.number_of_pages_median ?? 300,
    },
  });

  console.log('Записано в БД:', savedBook);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
