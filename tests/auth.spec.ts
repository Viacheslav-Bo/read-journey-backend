import { test, expect, request as apiRequest } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

// Унікальний email на кожен запуск, щоб тести не падали через "Email in use"
const uniqueEmail = () =>
  `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

test.describe('Auth flow', () => {
  test('register: success', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/auth/register`, {
      data: { name: 'Mike', email: uniqueEmail(), password: 'password123' },
    });

    expect(res.status()).toBe(201);
    const body = await res.json();

    expect(body.data.user).toMatchObject({ name: 'Mike' });
    expect(body.data.user.password).toBeUndefined();
    expect(body.data.accessToken).toBeTruthy();

    // refresh має прийти httpOnly-кукою, не в тілі
    const cookies = res.headers()['set-cookie'];
    expect(cookies).toContain('refreshToken=');
    expect(cookies).toContain('HttpOnly');
  });

  test('register: duplicate email → 409', async ({ request }) => {
    const email = uniqueEmail();
    await request.post(`${BASE_URL}/auth/register`, {
      data: { name: 'Mike', email, password: 'password123' },
    });

    const res = await request.post(`${BASE_URL}/auth/register`, {
      data: { name: 'Mike', email, password: 'password123' },
    });

    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.message).toMatch(/email in use/i);
  });

  test('register: short password → 400', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/auth/register`, {
      data: { name: 'Mike', email: uniqueEmail(), password: '123' },
    });

    expect(res.status()).toBe(400);
  });

  test('register: missing name → 400', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/auth/register`, {
      data: { email: uniqueEmail(), password: 'password123' },
    });

    expect(res.status()).toBe(400);
  });

  test('login: success', async ({ request }) => {
    const email = uniqueEmail();
    await request.post(`${BASE_URL}/auth/register`, {
      data: { name: 'Mike', email, password: 'password123' },
    });

    const res = await request.post(`${BASE_URL}/auth/login`, {
      data: { email, password: 'password123' },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.accessToken).toBeTruthy();
    expect(body.data.user.password).toBeUndefined();
  });

  test('login: wrong password → 401', async ({ request }) => {
    const email = uniqueEmail();
    await request.post(`${BASE_URL}/auth/register`, {
      data: { name: 'Mike', email, password: 'password123' },
    });

    const res = await request.post(`${BASE_URL}/auth/login`, {
      data: { email, password: 'wrongpassword' },
    });

    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.message).toMatch(/invalid credentials/i);
  });

  test('login: nonexistent email → 401 (same message as wrong password)', async ({
    request,
  }) => {
    const res = await request.post(`${BASE_URL}/auth/login`, {
      data: { email: uniqueEmail(), password: 'password123' },
    });

    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.message).toMatch(/invalid credentials/i);
  });

  test('/me: no token → 401', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/auth/me`);
    expect(res.status()).toBe(401);
  });

  test('/me: invalid token → 401', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: 'Bearer garbage.invalid.token' },
    });
    expect(res.status()).toBe(401);
  });

  test('/me: valid token → 200 with userId', async ({ request }) => {
    const email = uniqueEmail();
    const registerRes = await request.post(`${BASE_URL}/auth/register`, {
      data: { name: 'Mike', email, password: 'password123' },
    });
    const { accessToken } = (await registerRes.json()).data;

    const res = await request.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.user.userId).toBeTruthy();
  });

  test('logout → clears cookie, /refresh no longer works with it', async ({
    request,
  }) => {
    const email = uniqueEmail();
    // request-фікстура сама тримає куки в межах одного контексту,
    // тому просто виконуємо запити послідовно
    await request.post(`${BASE_URL}/auth/register`, {
      data: { name: 'Mike', email, password: 'password123' },
    });

    const logoutRes = await request.post(`${BASE_URL}/auth/logout`);
    expect(logoutRes.status()).toBe(200);

    // після логауту refresh тією ж (вже видаленою) кукою має впасти
    const refreshRes = await request.post(`${BASE_URL}/auth/refresh`);
    expect(refreshRes.status()).toBe(401);
  });

  test('logout: idempotent — second call does not throw 500', async ({
    request,
  }) => {
    const email = uniqueEmail();
    await request.post(`${BASE_URL}/auth/register`, {
      data: { name: 'Mike', email, password: 'password123' },
    });

    await request.post(`${BASE_URL}/auth/logout`);
    const secondLogout = await request.post(`${BASE_URL}/auth/logout`);

    expect(secondLogout.status()).toBe(200);
  });

  test('logout: no cookie at all → 200, does not wipe other sessions', async ({
    request,
  }) => {
    // Реєструємо ДРУГОГО юзера, щоб перевірити, що його сесія не постраждає
    const otherEmail = uniqueEmail();
    const otherRegisterRes = await request.post(`${BASE_URL}/auth/register`, {
      data: { name: 'Other', email: otherEmail, password: 'password123' },
    });
    const { accessToken: otherAccessToken } = (await otherRegisterRes.json())
      .data;

    // "чистий" контекст без збережених кук — глобальний apiRequest, а не фікстура
    const freshContext = await apiRequest.newContext();
    const logoutRes = await freshContext.post(`${BASE_URL}/auth/logout`);
    expect(logoutRes.status()).toBe(200);
    await freshContext.dispose();

    // сесія іншого юзера має лишитись живою
    const meRes = await request.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${otherAccessToken}` },
    });
    expect(meRes.status()).toBe(200);
  });

  test('refresh: rotates tokens and invalidates the old refresh cookie', async ({
    request,
  }) => {
    const email = uniqueEmail();
    const registerRes = await request.post(`${BASE_URL}/auth/register`, {
      data: { name: 'Mike', email, password: 'password123' },
    });
    const oldCookies = registerRes.headers()['set-cookie'];

    const refreshRes = await request.post(`${BASE_URL}/auth/refresh`);
    expect(refreshRes.status()).toBe(200);
    const newCookies = refreshRes.headers()['set-cookie'];
    const { accessToken: newAccessToken } = (await refreshRes.json()).data;

    expect(newCookies).not.toBe(oldCookies);

    // новий access має пройти /me
    const meRes = await request.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${newAccessToken}` },
    });
    expect(meRes.status()).toBe(200);
  });

  test('refresh: reusing an old (rotated) cookie fails', async ({
    request,
  }) => {
    const email = uniqueEmail();
    const registerRes = await request.post(`${BASE_URL}/auth/register`, {
      data: { name: 'Mike', email, password: 'password123' },
    });

    // Зберігаємо СТАРУ куку вручну з заголовка відповіді
    const rawSetCookie = registerRes.headers()['set-cookie'] ?? '';
    const oldRefreshMatch = rawSetCookie.match(/refreshToken=([^;]+)/);
    const oldRefreshToken = oldRefreshMatch?.[1];
    expect(oldRefreshToken).toBeTruthy();

    // Перший рефреш — успішний, ротує куку в контексті фікстури
    const firstRefresh = await request.post(`${BASE_URL}/auth/refresh`);
    expect(firstRefresh.status()).toBe(200);

    // Повторне використання СТАРОЇ (вже видаленої) куки — окремий "чистий"
    // контекст, у якому вручну підставляємо старий заголовок Cookie
    const freshContext = await apiRequest.newContext();
    const reuseRes = await freshContext.post(`${BASE_URL}/auth/refresh`, {
      headers: { Cookie: `refreshToken=${oldRefreshToken}` },
    });
    expect(reuseRes.status()).toBe(401);
    await freshContext.dispose();
  });

  test('refresh: without any cookie → 401', async ({ request }) => {
    const freshContext = await apiRequest.newContext();
    const res = await freshContext.post(`${BASE_URL}/auth/refresh`);
    expect(res.status()).toBe(401);
    await freshContext.dispose();
  });
});
