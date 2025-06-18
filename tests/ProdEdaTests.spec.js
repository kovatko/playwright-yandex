const { test, expect } = require('@playwright/test');
const fs = require('fs');
test.describe('Тесты для eda.yandex.ru', () => {
  // Arrange: Переход на главную страницу перед каждым тестом
  test.beforeEach(async ({ page }) => {
    await page.goto('https://testing.eda.tst.yandex.ru/')
  });

  // 1. Основные экшены
  test('Экшен: Клик по кнопке поиска', async ({ page }) => {
    // Arrange: Локатор для кнопки поиска
    const searchButton = page.getByRole('button', { name: 'Найти' });
    // Act: Клик по кнопке
    await searchButton.click();
    
    // Assert: Проверяем, что поле поиска стало видимым
    await expect(page.getByRole('combobox', { name: 'Найти ресторан, блюдо или товар' })).toBeVisible();
  });

  test('Экшен: Ввод текста в поле поиска', async ({ page }) => {
    // Arrange: Локатор для поля поиска
    const searchInput = page.getByRole('combobox', { name: 'Найти ресторан, блюдо или товар' });
    
    // Act: Ввод текста
    await searchInput.fill('Пицца');
    
    // Assert: Проверяем, что введенный текст соответствует
    await expect(searchInput).toHaveValue('Пицца');
  });

test('Экшен: Проверка фильтрации', async ({ page }) => {
  // Arrange: Подготовка - загрузка страницы и локаторы
  await page.goto('https://eda.yandex.ru/');
  const searchInput = page.getByRole('combobox', { name: 'Найти ресторан, блюдо или товар' });
  const searchButton = page.getByRole('button', { name: 'Найти' });
  const filterButton = page.getByRole('button', { name: 'Открыть шторку со всеми фильтрами' });
  const restaurantFilter = page.getByRole('checkbox', { name: 'Рестораны' });
  const applyFilterButton = page.getByRole('button', { name: 'Показать' });
  const restaurantTab = page.getByRole('button', { name: 'Рестораны' });

  // Act: Ввод текста в поле поиска и клик по кнопке поиска/
  await searchInput.fill('Пицца');
  await searchButton.click();

  // Assert: Проверка, что текст введен корректно
  await expect(searchInput).toHaveValue('Пицца');

  // Act: Открытие панели фильтров
  await filterButton.click();

  // Act: Выбор фильтра "Рестораны"
  await restaurantFilter.waitFor({ state: 'visible', timeout: 5000 });
  await restaurantFilter.check();

  // Act: Применение фильтров
  await applyFilterButton.click();

  // Assert: Проверка, что вкладка "Рестораны" активна
  await expect(restaurantTab).toHaveAttribute('aria-current', 'true');
});

test('[Desktop] Карточка товара без стоков', async ({ page }) => {
    // Arrange: Подготовка - замокание API и локаторы
    await page.on('request', request => {
      if (request.url().includes('/api/v2/menu')) {
        console.log('Запрос к API:', request.url());
      }
    });

    await page.route('**/api/v2/menu/product*', async (route) => {
      try {
        const mockData = JSON.parse(fs.readFileSync('C:/Users/4702306/playwright-demo/mocks/api-v2-menu-product-52584.json'));
        console.log('Перехвачен запрос /api/v2/menu/product:', route.request().url());
        console.log('Мок /api/v2/menu/product:', mockData.menu_item.name, mockData.menu_item.available, mockData.menu_item.inStock);
        await route.fulfill({ json: mockData });
      } catch (error) {
        console.error('Ошибка при чтении мока /api/v2/menu/product:', error.message);
        await route.continue();
      }
    });

    await page.route('**/api/v1/product/cross-brand-products', async (route) => {
      try {
        const mockData = JSON.parse(fs.readFileSync('C:/Users/4702306/playwright-demo/mocks/api-v1-product-cross-brand-products-52584.json'));
        console.log('Перехвачен запрос /api/v1/product/cross-brand-products:', route.request().url());
        await route.fulfill({ json: mockData });
      } catch (error) {
        console.error('Ошибка при чтении мока /api/v1/product/cross-brand-products:', error.message);
        await route.continue();
      }
    });

    const searchInput = page.getByRole('combobox', { name: 'Найти ресторан, блюдо или товар' });
    const searchButton = page.getByRole('button', { name: 'Найти' });
    const productCard = page.getByRole('button', { name: 'Вода артезианская Шишкин лес Спорт негазированная, 52, 1л' }).first();
    const addToCartButton = page.getByRole('button', { name: /добавить/i }).first();
    const checkoutButton = page.getByRole('button', { name: 'Оформить заказ' });
    const otherStoresBlock = page.locator('div.CrossBrandProductsWidgetDesktop_root_r124jvvf').filter({ has: page.getByRole('heading', { name: 'В других магазинах' }) });
    const similarProducts = page.locator('a.CrossBrandProductsWidgetDesktop_item_imugn97');
    const bestPriceLabel = similarProducts.first().locator('.BetterPriceLabel_root_r1igs10f');

    // Act: Ввод текста в поле поиска и клик по кнопке поиска
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.fill('Шишкин Лес');
    await searchButton.click();

    // Act: Установка адреса доставки
    await page.getByRole('button', { name: 'Укажите адрес доставки' }).click();
    await page.getByTestId('address-input').fill('Ленинский проспект 37а');
    await page.getByLabel('Ленинский проспект, 37АМосква').click();
    await page.getByTestId('desktop-location-modal-confirm-button').click();

    // Act: Ожидание карточки товара
    await productCard.waitFor({ state: 'visible', timeout: 15000 });
    console.log('Найдено карточек:', await page.locator('[data-testid="product-card"]').count());

    // Assert: Проверка, что текст поиска введен корректно
    await expect(searchInput).toHaveValue('Шишкин Лес');

    // Act: Открытие карточки товара
    await productCard.click();
    console.log('URL после клика:', page.url());

    // Assert: Проверки карточки товара
    await addToCartButton.waitFor({ state: 'visible', timeout: 10000 });
    console.log('Текст кнопки:', await addToCartButton.textContent());
    await expect(addToCartButton).toBeVisible();
    await expect(addToCartButton).toBeDisabled();
    await expect(checkoutButton).not.toBeVisible();
    await expect(otherStoresBlock).toBeVisible();

    const productCount = await similarProducts.count();
    expect(productCount).toBe(2);

    const stores = await similarProducts.evaluateAll((nodes) =>
      nodes.map((node) => node.querySelector('.BrandProductItem_brandName_b1j7ivhi').textContent.trim())
    );
    const prices = await similarProducts.evaluateAll((nodes) =>
      nodes.map((node) => {
        const priceElement = node.querySelector('.BrandProductItem_priceWrapper_pkdznfi [class*="UiKitPrice"]');
        return priceElement ? parseFloat(priceElement.textContent.replace(/[^\d.]/g, '')) : 0;
      })
    );

    expect(stores).toEqual(['Верный', 'Магнит']);
    expect(prices).toEqual([17.00, 53.00]);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    await expect(bestPriceLabel).toBeVisible();

    // Act: Логи для отладки
    console.log('Найдено похожих товаров:', productCount);
    console.log('Магазины:', stores);
    console.log('Цены:', prices);

    await page.close();
  });
});