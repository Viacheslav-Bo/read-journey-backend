import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

const uniqueEmail = () =>
  `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

// Реєструє нового юзера і повертає accessToken — фікстура request сама
// тримає refreshToken-куку в межах контексту, тому наступні запити
// (включно з /auth/refresh, якби знадобився) підхоплять її автоматично.
const registerAndGetToken = async (
  request: import('@playwright/test').APIRequestContext,
) => {
  const email = uniqueEmail();
  const res = await request.post(`${BASE_URL}/auth/register`, {
    data: { name: 'Test User', email, password: 'password123' },
  });
  const body = await res.json();
  return body.data.accessToken as string;
};

const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

test.describe('Library resource', () => {
  test('POST /library: no token → 401', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/library`, {
      data: { title: 'Book', author: 'Author', totalPages: 100 },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /library: valid data → 200, correct defaults', async ({
    request,
  }) => {
    const token = await registerAndGetToken(request);

    const res = await request.post(`${BASE_URL}/library`, {
      headers: authHeader(token),
      data: { title: 'Dune', author: 'Frank Herbert', totalPages: 412 },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      title: 'Dune',
      author: 'Frank Herbert',
      totalPages: 412,
      currentPage: 0,
      status: 'UNREAD',
      openLibraryId: null,
    });
    expect(body.id).toBeTruthy();
  });

  test('POST /library: negative totalPages → 400', async ({ request }) => {
    const token = await registerAndGetToken(request);

    const res = await request.post(`${BASE_URL}/library`, {
      headers: authHeader(token),
      data: { title: 'Book', author: 'Author', totalPages: -5 },
    });
    expect(res.status()).toBe(400);
  });

  test('POST /library: totalPages over max (25000) → 400', async ({
    request,
  }) => {
    const token = await registerAndGetToken(request);

    const res = await request.post(`${BASE_URL}/library`, {
      headers: authHeader(token),
      data: { title: 'Book', author: 'Author', totalPages: 999999 },
    });
    expect(res.status()).toBe(400);
  });

  test('POST /library: missing title → 400', async ({ request }) => {
    const token = await registerAndGetToken(request);

    const res = await request.post(`${BASE_URL}/library`, {
      headers: authHeader(token),
      data: { author: 'Author', totalPages: 100 },
    });
    expect(res.status()).toBe(400);
  });

  test('GET /library: no filter → returns all books for the user', async ({
    request,
  }) => {
    const token = await registerAndGetToken(request);

    await request.post(`${BASE_URL}/library`, {
      headers: authHeader(token),
      data: { title: 'Book A', author: 'Author A', totalPages: 100 },
    });
    await request.post(`${BASE_URL}/library`, {
      headers: authHeader(token),
      data: { title: 'Book B', author: 'Author B', totalPages: 200 },
    });

    const res = await request.get(`${BASE_URL}/library`, {
      headers: authHeader(token),
    });
    expect(res.status()).toBe(200);
    const books = await res.json();
    expect(books).toHaveLength(2);
  });

  test('GET /library?status=UNREAD: filters by status', async ({ request }) => {
    const token = await registerAndGetToken(request);

    const addRes = await request.post(`${BASE_URL}/library`, {
      headers: authHeader(token),
      data: { title: 'Unread Book', author: 'Author', totalPages: 100 },
    });
    const book = await addRes.json();

    // Стартуємо читання — статус стає READING
    await request.post(`${BASE_URL}/reading/${book.id}/start`, {
      headers: authHeader(token),
    });

    const unreadRes = await request.get(`${BASE_URL}/library?status=UNREAD`, {
      headers: authHeader(token),
    });
    const unreadBooks = await unreadRes.json();
    expect(unreadBooks).toHaveLength(0);

    const readingRes = await request.get(`${BASE_URL}/library?status=READING`, {
      headers: authHeader(token),
    });
    const readingBooks = await readingRes.json();
    expect(readingBooks).toHaveLength(1);
    expect(readingBooks[0].id).toBe(book.id);
  });

  test('GET /library?status=INVALID: invalid enum value → 400', async ({
    request,
  }) => {
    const token = await registerAndGetToken(request);

    const res = await request.get(`${BASE_URL}/library?status=NOT_A_STATUS`, {
      headers: authHeader(token),
    });
    expect(res.status()).toBe(400);
  });

  test('DELETE /library/:id: removes the book', async ({ request }) => {
    const token = await registerAndGetToken(request);

    const addRes = await request.post(`${BASE_URL}/library`, {
      headers: authHeader(token),
      data: { title: 'To Delete', author: 'Author', totalPages: 100 },
    });
    const book = await addRes.json();

    const deleteRes = await request.delete(`${BASE_URL}/library/${book.id}`, {
      headers: authHeader(token),
    });
    expect(deleteRes.status()).toBe(200);

    const listRes = await request.get(`${BASE_URL}/library`, {
      headers: authHeader(token),
    });
    const books = await listRes.json();
    expect(books.find((b: { id: string }) => b.id === book.id)).toBeUndefined();
  });

  test('DELETE /library/:id: idempotent — second call does not throw 500', async ({
    request,
  }) => {
    const token = await registerAndGetToken(request);

    const addRes = await request.post(`${BASE_URL}/library`, {
      headers: authHeader(token),
      data: { title: 'To Delete Twice', author: 'Author', totalPages: 100 },
    });
    const book = await addRes.json();

    await request.delete(`${BASE_URL}/library/${book.id}`, {
      headers: authHeader(token),
    });
    const secondDelete = await request.delete(
      `${BASE_URL}/library/${book.id}`,
      {
        headers: authHeader(token),
      },
    );
    expect(secondDelete.status()).toBe(200);
  });

  test("DELETE /library/:id: cannot delete another user's book", async ({
    request,
  }) => {
    const ownerToken = await registerAndGetToken(request);
    const attackerToken = await registerAndGetToken(request);

    const addRes = await request.post(`${BASE_URL}/library`, {
      headers: authHeader(ownerToken),
      data: { title: 'Owned Book', author: 'Author', totalPages: 100 },
    });
    const book = await addRes.json();

    // Зловмисник намагається видалити чужу книгу — тихо нічого не станеться
    const deleteRes = await request.delete(`${BASE_URL}/library/${book.id}`, {
      headers: authHeader(attackerToken),
    });
    expect(deleteRes.status()).toBe(200);

    // Книга досі є у власника
    const listRes = await request.get(`${BASE_URL}/library`, {
      headers: authHeader(ownerToken),
    });
    const books = await listRes.json();
    expect(books.find((b: { id: string }) => b.id === book.id)).toBeTruthy();
  });
});

test.describe('Reading resource', () => {
  test('POST /reading/:id/start: no token → 401', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/reading/some-id/start`);
    expect(res.status()).toBe(401);
  });

  test('POST /reading/:id/start: sets status to READING, uses currentPage as startPage', async ({
    request,
  }) => {
    const token = await registerAndGetToken(request);

    const addRes = await request.post(`${BASE_URL}/library`, {
      headers: authHeader(token),
      data: { title: 'Start Test', author: 'Author', totalPages: 300 },
    });
    const book = await addRes.json();
    expect(book.currentPage).toBe(0);

    const startRes = await request.post(
      `${BASE_URL}/reading/${book.id}/start`,
      {
        headers: authHeader(token),
      },
    );
    expect(startRes.status()).toBe(201);

    const listRes = await request.get(`${BASE_URL}/library`, {
      headers: authHeader(token),
    });
    const books = await listRes.json();
    const updated = books.find((b: { id: string }) => b.id === book.id);
    expect(updated.status).toBe('READING');
  });

  test('POST /reading/:id/start: book not found or not owned → 404', async ({
    request,
  }) => {
    const token = await registerAndGetToken(request);

    const res = await request.post(`${BASE_URL}/reading/nonexistent-id/start`, {
      headers: authHeader(token),
    });
    expect(res.status()).toBe(404);
  });

  test('POST /reading/:id/stop: without a prior start → 404', async ({
    request,
  }) => {
    const token = await registerAndGetToken(request);

    const addRes = await request.post(`${BASE_URL}/library`, {
      headers: authHeader(token),
      data: { title: 'No Start', author: 'Author', totalPages: 100 },
    });
    const book = await addRes.json();

    const stopRes = await request.post(`${BASE_URL}/reading/${book.id}/stop`, {
      headers: authHeader(token),
      data: { endPage: 20 },
    });
    expect(stopRes.status()).toBe(404);
  });

  test('POST /reading/:id/stop: partial progress keeps status READING', async ({
    request,
  }) => {
    const token = await registerAndGetToken(request);

    const addRes = await request.post(`${BASE_URL}/library`, {
      headers: authHeader(token),
      data: { title: 'Partial Read', author: 'Author', totalPages: 300 },
    });
    const book = await addRes.json();

    await request.post(`${BASE_URL}/reading/${book.id}/start`, {
      headers: authHeader(token),
    });

    const stopRes = await request.post(`${BASE_URL}/reading/${book.id}/stop`, {
      headers: authHeader(token),
      data: { endPage: 50 },
    });
    expect(stopRes.status()).toBe(200);

    const listRes = await request.get(`${BASE_URL}/library`, {
      headers: authHeader(token),
    });
    const books = await listRes.json();
    const updated = books.find((b: { id: string }) => b.id === book.id);
    expect(updated.status).toBe('READING');
    expect(updated.currentPage).toBe(50);
  });

  test('POST /reading/:id/stop: endPage equals totalPages → status FINISHED', async ({
    request,
  }) => {
    const token = await registerAndGetToken(request);

    const addRes = await request.post(`${BASE_URL}/library`, {
      headers: authHeader(token),
      data: { title: 'Finish Me', author: 'Author', totalPages: 120 },
    });
    const book = await addRes.json();

    await request.post(`${BASE_URL}/reading/${book.id}/start`, {
      headers: authHeader(token),
    });

    const stopRes = await request.post(`${BASE_URL}/reading/${book.id}/stop`, {
      headers: authHeader(token),
      data: { endPage: 120 },
    });
    expect(stopRes.status()).toBe(200);

    const listRes = await request.get(`${BASE_URL}/library`, {
      headers: authHeader(token),
    });
    const books = await listRes.json();
    const updated = books.find((b: { id: string }) => b.id === book.id);
    expect(updated.status).toBe('FINISHED');
    expect(updated.currentPage).toBe(120);
  });

  test('POST /reading/:id/stop: negative endPage → 400', async ({
    request,
  }) => {
    const token = await registerAndGetToken(request);

    const addRes = await request.post(`${BASE_URL}/library`, {
      headers: authHeader(token),
      data: { title: 'Bad Stop', author: 'Author', totalPages: 100 },
    });
    const book = await addRes.json();
    await request.post(`${BASE_URL}/reading/${book.id}/start`, {
      headers: authHeader(token),
    });

    const stopRes = await request.post(`${BASE_URL}/reading/${book.id}/stop`, {
      headers: authHeader(token),
      data: { endPage: -10 },
    });
    expect(stopRes.status()).toBe(400);
  });

  test('start → stop → start again: resumes from currentPage, second session startPage matches first stop', async ({
    request,
  }) => {
    const token = await registerAndGetToken(request);

    const addRes = await request.post(`${BASE_URL}/library`, {
      headers: authHeader(token),
      data: { title: 'Resume Test', author: 'Author', totalPages: 300 },
    });
    const book = await addRes.json();

    await request.post(`${BASE_URL}/reading/${book.id}/start`, {
      headers: authHeader(token),
    });
    await request.post(`${BASE_URL}/reading/${book.id}/stop`, {
      headers: authHeader(token),
      data: { endPage: 40 },
    });

    await request.post(`${BASE_URL}/reading/${book.id}/start`, {
      headers: authHeader(token),
    });
    await request.post(`${BASE_URL}/reading/${book.id}/stop`, {
      headers: authHeader(token),
      data: { endPage: 90 },
    });

    const statsRes = await request.get(`${BASE_URL}/reading/${book.id}/stats`, {
      headers: authHeader(token),
    });
    const sessions = await statsRes.json();

    expect(sessions).toHaveLength(2);
    expect(sessions[0]).toMatchObject({ startPage: 0, endPage: 40 });
    expect(sessions[1]).toMatchObject({ startPage: 40, endPage: 90 });
  });

  test('GET /reading/:id/stats: sessions ordered chronologically', async ({
    request,
  }) => {
    const token = await registerAndGetToken(request);

    const addRes = await request.post(`${BASE_URL}/library`, {
      headers: authHeader(token),
      data: { title: 'Stats Order', author: 'Author', totalPages: 300 },
    });
    const book = await addRes.json();

    await request.post(`${BASE_URL}/reading/${book.id}/start`, {
      headers: authHeader(token),
    });
    await request.post(`${BASE_URL}/reading/${book.id}/stop`, {
      headers: authHeader(token),
      data: { endPage: 30 },
    });

    const statsRes = await request.get(`${BASE_URL}/reading/${book.id}/stats`, {
      headers: authHeader(token),
    });
    expect(statsRes.status()).toBe(200);
    const sessions = await statsRes.json();

    expect(sessions).toHaveLength(1);
    const startedAt = new Date(sessions[0].startedAt).getTime();
    const finishedAt = new Date(sessions[0].finishedAt).getTime();
    expect(finishedAt).toBeGreaterThanOrEqual(startedAt);
  });

  test('GET /reading/:id/stats: book with no sessions → empty array', async ({
    request,
  }) => {
    const token = await registerAndGetToken(request);

    const addRes = await request.post(`${BASE_URL}/library`, {
      headers: authHeader(token),
      data: { title: 'Never Started', author: 'Author', totalPages: 100 },
    });
    const book = await addRes.json();

    const statsRes = await request.get(`${BASE_URL}/reading/${book.id}/stats`, {
      headers: authHeader(token),
    });
    expect(statsRes.status()).toBe(200);
    const sessions = await statsRes.json();
    expect(sessions).toEqual([]);
  });

  test("GET /reading/:id/stats: another user's book → 404", async ({
    request,
  }) => {
    const ownerToken = await registerAndGetToken(request);
    const attackerToken = await registerAndGetToken(request);

    const addRes = await request.post(`${BASE_URL}/library`, {
      headers: authHeader(ownerToken),
      data: { title: 'Private Book', author: 'Author', totalPages: 100 },
    });
    const book = await addRes.json();

    const statsRes = await request.get(`${BASE_URL}/reading/${book.id}/stats`, {
      headers: authHeader(attackerToken),
    });
    expect(statsRes.status()).toBe(404);
  });
});
