const { test, expect } = require('@playwright/test');

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
});