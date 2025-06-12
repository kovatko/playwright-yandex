const { test, expect } = require('@playwright/test');

test.describe('Тестирование авторизации', () => {
  test('Успешная авторизация через логин и пароль', async ({ page }) => {
    // Шаг 1: Перейти на главную страницу
    await page.goto('https://testing.eda.tst.yandex.ru/moscow?shippingType=delivery');
    
    // Проверка главной кнопки "Войти"
    try {
      await expect(page.locator('text="Войти"')).toBeVisible({ timeout: 15000 });
      console.log('Главное меню страницы каталога корректно загружено');
    } catch (error) {
      console.error('Ошибка при проверке главной кнопки "Войти"');
      await page.screenshot({ path: 'error_screenshot_1.png' });
      throw error;
    }

    // Шаг 2: Нажать на кнопку "Войти"
    try {
      await page.locator('text="Войти"').click();
      console.log('Кнопка "Войти" нажата');
    } catch (error) {
      await page.screenshot({ path: 'screenshot_login_page.png' });
      throw new Error('Не удалось найти кнопку "Войти" на главной странице');
    }

    // Шаг 3: Ждать редиректа на страницу авторизации
    try {
      await page.waitForURL('https://passport-test.yandex.ru/auth**', { timeout: 20000 });
      console.log('Страница авторизации загружена');
    } catch (error) {
      console.error('Сбой при переходе на страницу авторизации');
      await page.screenshot({ path: 'error_screenshot_3.png' });
      throw error;
    }

    // Шаг 4: Нажать на кнопку "Ещё"
    try {
      await expect(page.locator('text="Ещё"')).toBeVisible({ timeout: 15000 });
      await page.locator('text="Ещё"').click();
      console.log('Кнопка "Ещё" нажата');
    } catch (error) {
      await page.screenshot({ path: 'screenshot_more_button.png' });
      throw new Error('Не удалось найти кнопку "Ещё" на странице авторизации');
    }

    // Шаг 5: Проверка и клик на "Войти по логину"
    try {
      await expect(page.locator('text="Войти по логину"')).toBeVisible({ timeout: 10000 });
      await page.locator('text="Войти по логину"').click();
      console.log('Кнопка "Войти по логину" нажата');
    } catch (error) {
      await page.screenshot({ path: 'screenshot_login_with_login.png' });
      throw new Error('Не удалось найти кнопку "Войти по логину"');
    }

    // Шаг 6: Ввести логин и нажать "Войти"
    try {
      await page.fill('input#passp-field-login', 'yndx-test-kivipivi-ycjlfl');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      console.log('Логин успешно введен и кнопка "Войти" активирована');
      
      // Проверка на ошибки валидации
      const errorLocator = page.locator('.passp-form-field__error');
      if (await errorLocator.isVisible()) {
        console.error('Ошибка валидации логина:', await errorLocator.textContent());
        await page.screenshot({ path: 'error_login_validation.png' });
      }
    } catch (error) {
      await page.screenshot({ path: 'error_entering_login.png' });
      throw new Error('Не удалось ввести логин');
    }

    // Шаг 7: Ввести пароль и нажать "Продолжить"
    try {
      await page.fill('input#passp-field-passwd', '6rQm.0nXm');
      await page.locator('text="Продолжить"').click();
      console.log('Пароль успешно введен');
    } catch (error) {
      await page.screenshot({ path: 'error_entering_password.png' });
      throw new Error('Не удалось ввести пароль');
    }

    // Шаг 8: Ждать возвращения на главную страницу
    try {
      await page.waitForURL('https://testing.eda.tst.yandex.ru/moscow**', { timeout: 200000 });
      console.log('Пользователь успешно авторизован');
    } catch (error) {
      console.error('Не удалось вернуться на главную страницу после авторизации');
      await page.screenshot({ path: 'error_after_authorization.png' });
      throw error;
    }

    // Шаг 9: Проверка успешной авторизации
    try {
      await expect(page.locator('text="Мои заказы"')).toBeVisible({ timeout: 15000 });
      console.log('Пользователь успешно зашел в личный кабинет');
    } catch (error) {
      console.error('Не обнаружено элементов личного кабинета');
      await page.screenshot({ path: 'error_login_success.png' });
      throw error;
    }
  });
});
