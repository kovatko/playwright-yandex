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
  //await filterButton.waitFor({ state: 'visible', timeout: 10000 });
  await filterButton.click();

  // Act: Выбор фильтра "Рестораны"
  //await restaurantFilter.waitFor({ state: 'visible', timeout: 10000 });
  await restaurantFilter.check();

  // Act: Применение фильтров
  //await applyFilterButton.waitFor({ state: 'visible', timeout: 10000 });
  await applyFilterButton.click();

  // Assert: Проверка, что вкладка "Рестораны" активна
  await expect(restaurantTab).toHaveAttribute('aria-current', 'true');
});
    

  
 

/*   test('Экшен: Выбор опции из выпадающего списка', async ({ page }) => {
    // Arrange: Локатор для выпадающего списка (например, сортировка)
    const sortDropdown = page.locator('text=Сортировка').first();
    
    // Act: Клик и выбор опции
    await sortDropdown.click();
    await page.locator('text=По рейтингу').click();
    
    // Assert: Проверяем, что выбранная опция отображается
    await expect(page.locator('text=По рейтингу')).toBeVisible();
  });

  test('Экшен: Навигация по странице и возврат назад', async ({ page }) => {
    // Arrange: Локатор для ссылки на категорию (например, "Пицца")
    const categoryLink = page.locator('text=Пицца').first();
    
    // Act: Клик по категории и возврат назад
    await categoryLink.click();
    await page.goBack();
    
    // Assert: Проверяем, что вернулись на главную страницу
    await expect(page).toHaveURL('https://eda.yandex.ru/');
  });

  test('Экшен: Ожидание загрузки элемента', async ({ page }) => {
    // Arrange: Локатор для элемента, который должен загрузиться
    const restaurantCard = page.locator('.RestaurantCard').first();
    
    // Act: Ожидание появления элемента
    await restaurantCard.waitFor({ state: 'visible' });
    
    // Assert: Проверяем, что карточка ресторана видима
    await expect(restaurantCard).toBeVisible();
  });

  // 2. Основные утверждения (assertions)
  test('Assertion: Проверка заголовка страницы', async ({ page }) => {
    // Act: Получаем заголовок страницы
    const title = await page.title();
    
    // Assert: Проверяем, что заголовок содержит ожидаемый текст
    await expect(page).toHaveTitle(/Яндекс Еда/);
  });

  test('Assertion: Проверка видимости элемента', async ({ page }) => {
    // Arrange: Локатор для логотипа
    const logo = page.locator('img[alt="Яндекс Еда"]');
    
    // Assert: Проверяем, что логотип виден
    await expect(logo).toBeVisible();
  });

  test('Assertion: Проверка текста элемента', async ({ page }) => {
    // Arrange: Локатор для заголовка на главной
    const heading = page.locator('h1').first();
    
    // Assert: Проверяем точное совпадение текста
    await expect(heading).toHaveText('Закажите еду из ресторанов');
  });

  test('Assertion: Проверка атрибута элемента', async ({ page }) => {
    // Arrange: Локатор для поля поиска
    const searchInput = page.locator('input[placeholder="Найти еду или ресторан"]');
    
    // Assert: Проверяем значение атрибута placeholder
    await expect(searchInput).toHaveAttribute('placeholder', 'Найти еду или ресторан');
  });

  test('Assertion: Проверка количества элементов', async ({ page }) => {
    // Arrange: Локатор для карточек ресторанов
    const restaurantCards = page.locator('.RestaurantCard');
    
    // Assert: Проверяем, что на странице есть хотя бы 5 карточек ресторанов
    await expect(restaurantCards).toHaveCount({ min: 5 });
  });

  test('Assertion: Проверка URL страницы', async ({ page }) => {
    // Assert: Проверяем точный URL
    await expect(page).toHaveURL('https://eda.yandex.ru/');
  });

  test('Assertion: Проверка CSS-класса элемента', async ({ page }) => {
    // Arrange: Локатор для кнопки поиска
    const searchButton = page.locator('button[aria-label="Поиск"]');
    
    // Assert: Проверяем, что кнопка имеет определенный класс
    await expect(searchButton).toHaveClass(/Button/);
  });

  test('Assertion: Проверка отсутствия элемента', async ({ page }) => {
    // Arrange: Локатор для несуществующего элемента
    const nonExistentElement = page.locator('text=Несуществующий текст');
    
    // Assert: Проверяем, что элемент не виден
    await expect(nonExistentElement).toBeHidden();
  }); */
});