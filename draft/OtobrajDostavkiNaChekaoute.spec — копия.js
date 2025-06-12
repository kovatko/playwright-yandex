const { test, expect } = require('@playwright/test');

test.describe('Тестирование сценария работы с адресами и чекаутом', () => {
  test('Открытие бокового меню, добавление адреса и проверка комментария в корзине', async ({ page }) => {
    // Шаг 1: Открыть боковое меню
    await page.goto('https://testing.eda.tst.yandex.ru/moscow?shippingType=delivery'); // Замени на реальный URL сайта
    await page.click('button.Avatar_avatarButton[aria-label="Профиль"]'); // Селектор кнопки бокового меню
    await expect(page.locator('#sidebar')).toBeVisible(); // Проверка, что боковое меню открыто

    // Шаг 2: Нажать на "Мои адреса"
    await page.click('a#my-addresses'); // Замени на реальный селектор для "Мои адреса"
    await expect(page.locator('#addresses-list')).toBeVisible(); // Проверка, что открыто окно со списком адресов
    await page.screenshot({ path: 'screenshots/addresses_list.png' }); // Скриншот списка адресов

    // Шаг 3: Нажать на кнопку "+"
    await page.click('button#add-address'); // Замени на реальный селектор кнопки добавления адреса
    await expect(page.locator('#map')).toBeVisible(); // Проверка, что открыта карта

    // Шаг 4: Выбрать адрес на карте и нажать "ОК"
    await page.click('#map .marker'); // Замени на реальный селектор маркера на карте
    await page.click('button#confirm-address'); // Замени на реальный селектор кнопки "ОК"
    await expect(page.locator('#address-form')).toBeVisible(); // Проверка, что открыта форма нового адреса
    await page.screenshot({ path: 'screenshots/address_form.png' }); // Скриншот формы адреса

    // Шаг 5: Заполнить форму адреса и сохранить
    await page.fill('input#comment', 'Оставьте заказ у двери'); // Замени на реальный селектор поля комментария
    await page.fill('input#entrance', '2'); // Замени на реальный селектор поля подъезда
    await page.fill('input#floor', '5'); // Замени на реальный селектор поля этажа
    await page.fill('input#apartment', '12'); // Замени на реальный селектор поля квартиры
    await page.fill('input#intercom', '1234'); // Замени на реальный селектор поля домофона
    await page.click('button#save-address'); // Замени на реальный селектор кнопки "Сохранить"

    // Вернуться в каталог и выбрать новый адрес
    await page.click('a#catalog-link'); // Замени на реальный селектор ссылки на каталог
    await expect(page.locator('#catalog')).toBeVisible(); // Проверка, что открыт каталог
    await page.selectOption('select#address-selector', 'new-address'); // Замени 'new-address' на реальный value
    await expect(page.locator('select#address-selector')).toHaveValue('new-address'); // Проверка, что адрес выбран

    // Шаг 6: Собрать корзину в ресторане
    await page.click('a#restaurant'); // Замени на реальный селектор ресторана
    await page.click('button#add-to-cart'); // Замени на реальный селектор кнопки добавления в корзину
    await page.click('a#checkout'); // Замени на реальный селектор ссылки на чекаут

    // Проверка экрана чекаута
    await expect(page.locator('#checkout')).toBeVisible(); // Проверка, что открыт экран чекаута
    const comment = await page.locator('#checkout-comment').textContent(); // Замени на реальный селектор комментария
    await expect(comment).toContain('Оставьте заказ у двери'); // Проверка комментария
    await page.screenshot({ path: 'screenshots/checkout.png' }); // Скриншот экрана чекаута
  });
});