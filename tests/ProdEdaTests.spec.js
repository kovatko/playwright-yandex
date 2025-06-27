import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Константы для таймаутов
const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 15000
};

test.describe('Тесты для eda.yandex.ru', () => {
  // Arrange: Переход на главную страницу перед каждым тестом
  test.beforeEach(async ({ page }) => {
    await page.goto('https://testing.eda.tst.yandex.ru/')
  });

  // 1. Основные экшены.
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
  // Arrange: Подготовка - локаторы (страница уже загружена в beforeEach)
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
  await restaurantFilter.waitFor({ state: 'visible', timeout: TIMEOUTS.SHORT });
  await restaurantFilter.check();

  // Act: Применение фильтров
  await applyFilterButton.click();

  // Assert: Проверка, что вкладка "Рестораны" активна
  await expect(restaurantTab).toHaveAttribute('aria-current', 'true');
});

test('[Desktop] Карточка товара без стоков', async ({ page }) => {
    // Arrange: Подготовка - замокание API и локаторы
    await page.route('**/api/v2/menu/product*', async (route) => {
      try {
        const mockData = JSON.parse(fs.readFileSync('./mocks/api-v2-menu-product-52584.json'));
        await route.fulfill({ json: mockData });
      } catch (error) {
        console.error('Ошибка при чтении мока /api/v2/menu/product:', error.message);
        await route.continue();
      }
    });

    await page.route('**/api/v1/product/cross-brand-products', async (route) => {
      try {
        const mockData = JSON.parse(fs.readFileSync('./mocks/api-v1-product-cross-brand-products-52584.json'));
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
    const otherStoresBlock = page.getByRole('heading', { name: 'В других магазинах'});
    const similarProducts = page.locator('a.imugn97');
    const bestPriceLabel = similarProducts.first().locator('.r1igs10f');

    // Act: Ввод текста в поле поиска и клик по кнопке поиска
    await searchInput.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
    await searchInput.fill('Шишкин Лес');
    await searchButton.click();

    // Act: Установка адреса доставки
    await page.getByRole('button', { name: 'Укажите адрес доставки' }).click();
    await page.getByTestId('address-input').fill('Ленинский проспект 37а');
    await page.getByLabel('Ленинский проспект, 37АМосква').click();
    await page.getByRole('button', {name: 'ОК', exact: true}).click();

    // Act: Ожидание карточки товара
    await productCard.waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });

    // Assert: Проверка, что текст поиска введен корректно
    await expect(searchInput).toHaveValue('Шишкин Лес');

    // Act: Открытие карточки товара
    await productCard.click();

    // Assert: Проверки карточки товара
    await addToCartButton.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
    await expect(addToCartButton).toBeVisible();
    await expect(addToCartButton).toBeDisabled();
    await expect(checkoutButton).not.toBeVisible();
    await expect(otherStoresBlock).toBeVisible();

    const productCount = await similarProducts.count();
    expect(productCount).toBe(2);

    const stores = await similarProducts.evaluateAll((nodes) =>
  nodes.map((node) => node.querySelector('.pdihr61 .b1j7ivhi')?.textContent.trim() || '')
);
    const prices = await similarProducts.evaluateAll((nodes) =>
  nodes.map((node) => {
    const priceElement = node.querySelector('.pkdznfi .rwsi3wr.s6jougq');
    const text = priceElement ? priceElement.textContent.trim() : '0';
    return parseFloat(text.replace(/[^\d.]/g, '')) || 0;
  })
);

    expect(stores).toEqual(['Верный', 'Магнит']);
    expect(prices).toEqual([17.00, 53.00]);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    await expect(bestPriceLabel).toBeVisible();
  });
});
