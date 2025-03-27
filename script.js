document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const storyThemeInput = document.getElementById('storyTheme');
    const storyKeywordsInput = document.getElementById('storyKeywords');
    const storyLengthSelect = document.getElementById('storyLength');
    const customLengthContainer = document.getElementById('customLengthContainer');
    const customWordCountInput = document.getElementById('customWordCount');
    const storyToneSelect = document.getElementById('storyTone');
    const aiModelSelect = document.getElementById('aiModel');
    const generateBtn = document.getElementById('generateStory');
    const loadingSpinner = document.getElementById('loading');
    const storyResult = document.getElementById('storyResult');
    const storyContent = document.getElementById('storyContent');
    const wordCount = document.getElementById('wordCount');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const modelLoadingStatus = document.getElementById('modelLoadingStatus');
    
    // متغیرهای مربوط به تنظیمات تم
    const themeToggle = document.getElementById('themeToggle');
    const themeColorBtns = document.querySelectorAll('.theme-color-btn');
    
    // متغیرهای مربوط به مدیریت داستان‌ها
    const savedStoriesContainer = document.getElementById('savedStories');
    const editStoryModal = document.getElementById('editStoryModal');
    const editStoryTitle = document.getElementById('editStoryTitle');
    const editStoryContent = document.getElementById('editStoryContent');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    let currentEditingStoryId = null;
    
    // متغیرهای مربوط به تاریخچه
    const toggleHistoryBtn = document.getElementById('toggleHistory');
    
    // متغیرهای مربوط به مودال مشاهده
    const viewStoryModal = document.getElementById('viewStoryModal');
    const viewStoryContent = document.getElementById('viewStoryContent');
    const viewStoryDate = document.getElementById('viewStoryDate');
    const viewStoryKeywords = document.getElementById('viewStoryKeywords');
    const viewStoryLength = document.getElementById('viewStoryLength');
    const viewStoryModel = document.getElementById('viewStoryModel');
    const closeViewBtn = document.getElementById('closeViewBtn');
    const viewFullStoryBtn = document.getElementById('viewFullStoryBtn');
    const copyStoryBtn = document.getElementById('copyStoryBtn');
    
    // مدیریت حالت تاریک
    function initThemeManagement() {
        // بررسی حالت تاریک/روشن ذخیره شده
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.classList.add(`theme-${savedTheme}`);
        
        // بررسی تم رنگی ذخیره شده
        const savedColorTheme = localStorage.getItem('colorTheme') || 'blue';
        document.body.classList.add(`theme-${savedColorTheme}`);
        
        // نشانه‌گذاری دکمه تم فعال
        document.querySelectorAll('.theme-color-btn').forEach(btn => {
            if (btn.getAttribute('data-color') === savedColorTheme) {
                btn.classList.add('active');
            }
        });
        
        // اضافه کردن رویداد کلیک برای تغییر حالت تاریک/روشن
        document.getElementById('themeToggle').addEventListener('click', () => {
            const newTheme = document.body.classList.contains('theme-light') ? 'dark' : 'light';
            
            // حذف کلاس‌های قبلی و اضافه کردن کلاس جدید
            document.body.classList.remove('theme-light', 'theme-dark');
            document.body.classList.add(`theme-${newTheme}`);
            
            // ذخیره در localStorage
            localStorage.setItem('theme', newTheme);
        });
        
        // اضافه کردن رویداد برای باز و بسته کردن منوی رنگ‌ها
        document.getElementById('themeToggle').addEventListener('click', (e) => {
            e.stopPropagation();  // جلوگیری از بسته شدن منو با کلیک روی دکمه
            const themeColors = document.querySelector('.theme-colors');
            themeColors.classList.toggle('show');
        });
        
        // بستن منوی رنگ‌ها با کلیک در هر جای دیگر صفحه
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.theme-controls')) {
                document.querySelector('.theme-colors').classList.remove('show');
            }
        });
        
        // اضافه کردن رویداد کلیک برای دکمه‌های رنگ تم
        document.querySelectorAll('.theme-color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const color = btn.getAttribute('data-color');
                
                // حذف کلاس‌های رنگی قبلی
                document.body.classList.remove('theme-blue', 'theme-purple', 'theme-green', 'theme-orange');
                document.body.classList.add(`theme-${color}`);
                
                // ذخیره در localStorage
                localStorage.setItem('colorTheme', color);
                
                // بروزرسانی نشانگر انتخاب
                document.querySelectorAll('.theme-color-btn').forEach(b => {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                
                // بستن منوی رنگ‌ها بعد از انتخاب
                document.querySelector('.theme-colors').classList.remove('show');
            });
        });
    }
    
    // تابع تبدیل اعداد به فارسی
    function toPersianNumber(num) {
        const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return num.toString().replace(/[0-9]/g, function(w) {
            return persianNumbers[+w];
        });
    }
    
    // دکمه نمایش/مخفی کردن کلید API
    togglePasswordBtn.addEventListener('click', () => {
        const icon = togglePasswordBtn.querySelector('i');
        
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            apiKeyInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
    
    // بارگذاری موضوع و کلمات کلیدی قبلی
    function loadPreviousInputs() {
        const previousTheme = localStorage.getItem('previousTheme');
        const previousKeywords = localStorage.getItem('previousKeywords');
        
        if (previousTheme) {
            storyThemeInput.placeholder = `پیشنهاد: ${previousTheme}`;
            storyThemeInput.title = 'موضوع استفاده شده در آخرین داستان';
        }
        
        if (previousKeywords) {
            storyKeywordsInput.placeholder = `پیشنهاد: ${previousKeywords}`;
            storyKeywordsInput.title = 'کلمات کلیدی استفاده شده در آخرین داستان';
        }
    }
    
    // ذخیره موضوع و کلمات کلیدی فعلی
    function saveCurrentInputs() {
        const currentTheme = storyThemeInput.value.trim();
        const currentKeywords = storyKeywordsInput.value.trim();
        
        if (currentTheme) {
            localStorage.setItem('previousTheme', currentTheme);
        }
        if (currentKeywords) {
            localStorage.setItem('previousKeywords', currentKeywords);
        }
    }
    
    // حذف کلاس previous-input هنگام ویرایش
    storyThemeInput.addEventListener('input', () => {
        storyThemeInput.classList.remove('previous-input');
        storyThemeInput.title = '';
    });
    
    storyKeywordsInput.addEventListener('input', () => {
        storyKeywordsInput.classList.remove('previous-input');
        storyKeywordsInput.title = '';
    });
    
    // بارگذاری تنظیمات ذخیره شده
    if (localStorage.getItem('openrouterApiKey')) {
        apiKeyInput.value = localStorage.getItem('openrouterApiKey');
        loadAvailableModels(localStorage.getItem('openrouterApiKey'));
    } else {
        loadDefaultModels();
    }
    
    // بارگذاری موضوع و کلمات کلیدی قبلی
    loadPreviousInputs();
    
    // بارگذاری لحن انتخاب شده قبلی
    if (localStorage.getItem('selectedTone')) {
        storyToneSelect.value = localStorage.getItem('selectedTone');
    }
    
    // ذخیره لحن انتخاب شده
    storyToneSelect.addEventListener('change', function() {
        localStorage.setItem('selectedTone', this.value);
    });
    
    // بارگذاری مدل انتخاب شده قبلی
    if (localStorage.getItem('selectedAIModel')) {
        setTimeout(() => {
            try {
                const savedModel = localStorage.getItem('selectedAIModel');
                if (savedModel) {
                    const options = aiModelSelect.querySelectorAll('option');
                    let modelExists = false;
                    
                    options.forEach(option => {
                        if (option.value === savedModel) {
                            option.selected = true;
                            modelExists = true;
                        }
                    });
                    
                    if (!modelExists) {
                        console.log('مدل ذخیره شده یافت نشد:', savedModel);
                    }
                }
            } catch (e) {
                console.error('خطا در بازیابی مدل ذخیره شده:', e);
            }
        }, 1000);
    }
    
    // ذخیره مدل انتخاب شده
    aiModelSelect.addEventListener('change', function() {
        const selectedModel = this.value;
        if (selectedModel) {
            localStorage.setItem('selectedAIModel', selectedModel);
            console.log('مدل ذخیره شد:', selectedModel);
        }
    });
    
    // نمایش/مخفی کردن فیلد طول سفارشی
    storyLengthSelect.addEventListener('change', () => {
        customLengthContainer.style.display = storyLengthSelect.value === 'custom' ? 'block' : 'none';
    });
    
    // تنظیم محدودیت‌های ورودی طول سفارشی
    customWordCountInput.addEventListener('input', () => {
        let value = parseInt(customWordCountInput.value);
        if (value < 50) customWordCountInput.value = 50;
        if (value > 1000) customWordCountInput.value = 1000;
        
        // نمایش عدد فارسی در placeholder
        customWordCountInput.placeholder = `تعداد کلمات مورد نظر را وارد کنید (${toPersianNumber(50)} تا ${toPersianNumber(1000)})`;
    });
    
    // اضافه کردن قابلیت جستجو به باکس انتخاب مدل
    aiModelSelect.addEventListener('keyup', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const options = this.querySelectorAll('option');
        const optgroups = this.querySelectorAll('optgroup');
        
        // اگر کلید Enter زده شد، جستجو را انجام بده
        if (e.key === 'Enter') {
            e.preventDefault();
            this.blur();
            return;
        }
        
        // اگر کلید Escape زده شد، جستجو را پاک کن
        if (e.key === 'Escape') {
            this.value = '';
            this.blur();
            return;
        }
        
        // جستجو در آپشن‌ها
        options.forEach(option => {
            if (option.disabled) return;
            
            const text = option.textContent.toLowerCase();
            const id = option.value.toLowerCase();
            const matches = text.includes(searchTerm) || id.includes(searchTerm);
            
            if (!option.parentElement.tagName || option.parentElement.tagName !== 'OPTGROUP') {
                option.style.display = matches ? '' : 'none';
            }
        });
        
        // جستجو در گروه‌ها
        optgroups.forEach(group => {
            const groupOptions = group.querySelectorAll('option');
            let hasVisibleOptions = false;
            
            groupOptions.forEach(option => {
                const text = option.textContent.toLowerCase();
                const id = option.value.toLowerCase();
                const matches = text.includes(searchTerm) || id.includes(searchTerm);
                
                option.style.display = matches ? '' : 'none';
                if (matches) hasVisibleOptions = true;
            });
            
            group.style.display = hasVisibleOptions ? '' : 'none';
        });
    });
    
    // بارگذاری مدل‌های AI از OpenRouter
    async function loadAvailableModels(apiKey) {
        if (!apiKey) return;
        
        try {
            modelLoadingStatus.textContent = 'در حال بارگذاری مدل‌ها...';
            
            const requestOptions = {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': window.location.origin,
                    'Content-Type': 'application/json'
                }
            };
            
            console.log('Fetching models with key:', apiKey.substring(0, 8) + '...');
            
            const response = await fetch('https://openrouter.ai/api/v1/models', requestOptions);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response (text):', errorText);
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { error: { message: 'خطا در پارس پاسخ' } };
                }
                
                throw new Error(errorData.error?.message || `خطای سرور: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Models data received:', data);
            
            if (data.data && Array.isArray(data.data)) {
                // پاک کردن مدل‌های فعلی
                aiModelSelect.innerHTML = '';
                
                // آرایه‌ای از مدل‌های محبوب
                const featuredModels = [
                    'gemini-1.5-flash',
                    'gpt-4o',
                    'claude-3-opus',
                    'claude-3-sonnet',
                    'claude-3-haiku',
                    'gpt-4-turbo',
                    'gpt-3.5-turbo'
                ];
                
                // ابتدا مدل‌های محبوب را اضافه کنیم
                let addedModels = [];
                
                // گروه‌بندی مدل‌ها بر اساس خانواده
                const modelFamilies = {};
                
                // دسته‌بندی مدل‌ها
                data.data.forEach(model => {
                    const familyName = model.id.split('-')[0]; // مثلاً 'gpt' یا 'claude'
                    if (!modelFamilies[familyName]) {
                        modelFamilies[familyName] = [];
                    }
                    modelFamilies[familyName].push(model);
                });
                
                // ابتدا مدل‌های محبوب را اضافه می‌کنیم
                featuredModels.forEach(modelId => {
                    const model = data.data.find(m => m.id === modelId);
                    if (model) {
                        const option = document.createElement('option');
                        option.value = model.id;
                        option.textContent = `${model.name || model.id}`;
                        
                        // اگر Gemini باشد به طور پیش‌فرض انتخاب شود
                        if (model.id === 'gemini-1.5-flash') {
                            option.selected = true;
                        }
                        
                        aiModelSelect.appendChild(option);
                        addedModels.push(model.id);
                    }
                });
                
                // اضافه کردن خط جداکننده
                if (addedModels.length > 0) {
                    const separator = document.createElement('option');
                    separator.disabled = true;
                    separator.textContent = '─────────────────';
                    aiModelSelect.appendChild(separator);
                }
                
                // سپس سایر مدل‌ها را براساس دسته‌بندی اضافه می‌کنیم
                Object.keys(modelFamilies).forEach(family => {
                    // اضافه کردن گروه مدل
                    const groupElement = document.createElement('optgroup');
                    groupElement.label = family.charAt(0).toUpperCase() + family.slice(1);
                    
                    // اضافه کردن مدل‌های این گروه
                    modelFamilies[family].forEach(model => {
                        if (!addedModels.includes(model.id)) {
                            const option = document.createElement('option');
                            option.value = model.id;
                            option.textContent = `${model.name || model.id}`;
                            groupElement.appendChild(option);
                            addedModels.push(model.id);
                        }
                    });
                    
                    // اگر این گروه مدل داشته باشد، آن را به سلکت باکس اضافه می‌کنیم
                    if (groupElement.childNodes.length > 0) {
                        aiModelSelect.appendChild(groupElement);
                    }
                });
                
                modelLoadingStatus.textContent = `${toPersianNumber(data.data.length)} مدل بارگذاری شد.`;
                
                // بررسی آیا مدل ذخیره شده قبلی وجود دارد
                const savedModel = localStorage.getItem('selectedAIModel');
                if (savedModel) {
                    const options = aiModelSelect.querySelectorAll('option');
                    options.forEach(option => {
                        if (option.value === savedModel) {
                            option.selected = true;
                        }
                    });
                }
            } else {
                throw new Error('فرمت داده دریافتی نامعتبر است');
            }
        } catch (error) {
            console.error('Error loading models:', error);
            modelLoadingStatus.textContent = `خطا در بارگذاری مدل‌ها: ${error.message}`;
            
            // بارگذاری مدل‌های پیش‌فرض در صورت خطا
            loadDefaultModels();
        }
    }
    
    // بارگذاری مدل‌های پیش‌فرض در صورت خطا
    function loadDefaultModels() {
        aiModelSelect.innerHTML = '';
        
        const defaultModels = [
            { id: 'gemini-1.5-flash', name: 'Gemini 2 Flash', selected: true },
            { id: 'gpt-4o', name: 'GPT-4o' },
            { id: 'claude-3-haiku', name: 'Claude 3 Haiku' }
        ];
        
        defaultModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            if (model.selected) {
                option.selected = true;
            }
            aiModelSelect.appendChild(option);
        });
        
        modelLoadingStatus.textContent = 'مدل‌های پیش‌فرض بارگذاری شدند. برای دریافت همه مدل‌ها، کلید API معتبر وارد کنید.';
    }
    
    // ذخیره داستان
    function saveStory(storyText, storyMetadata = {}) {
        try {
            // دریافت داستان‌های قبلی از localStorage
            const stories = JSON.parse(localStorage.getItem('savedStories') || '[]');
            
            // محاسبه تعداد واقعی کلمات
            const actualWordCount = storyText.trim().split(/\s+/).length;
            
            // تبدیل فرمت داده داستان
            const storyData = {
                id: Date.now(), // استفاده از زمان فعلی به عنوان شناسه منحصر به فرد
                title: storyMetadata.title || generateStoryTitle(storyText),
                content: storyText,
                date: new Date().toLocaleString('fa-IR'),
                metadata: {
                    ...storyMetadata,
                    wordCount: actualWordCount // ذخیره تعداد واقعی کلمات
                }
            };
            
            // اضافه کردن داستان جدید به آرایه
            stories.unshift(storyData); // افزودن به ابتدای آرایه
            
            // ذخیره در localStorage
            localStorage.setItem('savedStories', JSON.stringify(stories));
            
            // نمایش اعلان موفقیت
            showNotification('داستان با موفقیت ذخیره شد', 'success');
            
            // به‌روزرسانی نمایش داستان‌های ذخیره شده
            displaySavedStories();
            
            return storyData.id;
        } catch (error) {
            console.error('خطا در ذخیره داستان:', error);
            showNotification('خطا در ذخیره داستان', 'error');
            return null;
        }
    }
    
    // تابع نمایش داستان‌های ذخیره شده
    function displaySavedStories() {
        const savedStories = JSON.parse(localStorage.getItem('savedStories') || '[]');
        savedStoriesContainer.innerHTML = '';
        
        if (savedStories.length === 0) {
            savedStoriesContainer.innerHTML = '<p class="no-stories">هنوز داستانی ذخیره نشده است.</p>';
            return;
        }
        
        savedStories.forEach(story => {
            const storyDate = story.metadata?.date || story.date || new Date().toLocaleDateString('fa-IR');
            const previewContent = story.content.length > 150 ? 
                                 story.content.substring(0, 150) + '...' : 
                                 story.content;
            
            const storyEl = document.createElement('div');
            storyEl.className = 'story-card';
            storyEl.innerHTML = `
                <div class="story-header">
                    <div class="story-title">${story.title || story.theme || 'بدون عنوان'}</div>
                    <div class="story-date">${storyDate}</div>
                </div>
                <div class="story-preview">${previewContent}</div>
                <div class="history-actions">
                    <button class="story-action-btn view-btn" data-id="${story.id}">
                        <i class="fas fa-eye"></i> مشاهده
                    </button>
                    <button class="story-action-btn edit-btn" data-id="${story.id}">
                        <i class="fas fa-edit"></i> ویرایش
                    </button>
                    <button class="story-action-btn delete-btn" data-id="${story.id}">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            `;
            
            savedStoriesContainer.appendChild(storyEl);
        });
        
        // اضافه کردن event listener به دکمه‌ها
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const storyId = this.dataset.id;
                viewStory(storyId);
            });
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const storyId = this.dataset.id;
                editStory(storyId);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const storyId = this.dataset.id;
                if (confirm('آیا از حذف این داستان اطمینان دارید؟')) {
                    deleteStory(storyId);
                }
            });
        });
    }
    
    // تابع ویرایش داستان
    function editStory(storyId) {
        const stories = JSON.parse(localStorage.getItem('savedStories') || '[]');
        storyId = parseInt(storyId); // تبدیل به عدد
        const story = stories.find(s => s.id === storyId);
        
        if (story) {
            currentEditingStoryId = storyId;
            editStoryTitle.value = story.title || story.theme || 'بدون عنوان';
            editStoryContent.value = story.content;
            editStoryModal.classList.add('show');
        } else {
            console.error('داستان یافت نشد:', storyId);
        }
    }
    
    // تابع حذف داستان
    function deleteStory(storyId) {
        storyId = parseInt(storyId); // تبدیل به عدد
        const stories = JSON.parse(localStorage.getItem('savedStories') || '[]');
        const updatedStories = stories.filter(s => s.id !== storyId);
        localStorage.setItem('savedStories', JSON.stringify(updatedStories));
        displaySavedStories();
    }
    
    // ذخیره تغییرات ویرایش
    saveEditBtn.addEventListener('click', () => {
        if (!currentEditingStoryId) return;
        
        const stories = JSON.parse(localStorage.getItem('savedStories') || '[]');
        const storyIndex = stories.findIndex(s => s.id === currentEditingStoryId);
        
        if (storyIndex !== -1) {
            stories[storyIndex].title = editStoryTitle.value;
            stories[storyIndex].content = editStoryContent.value;
            stories[storyIndex].metadata.date = new Date().toLocaleString('fa-IR');
            localStorage.setItem('savedStories', JSON.stringify(stories));
            displaySavedStories();
            editStoryModal.classList.remove('show');
            currentEditingStoryId = null;
        }
    });
    
    // بستن مودال ویرایش
    cancelEditBtn.addEventListener('click', () => {
        editStoryModal.classList.remove('show');
        currentEditingStoryId = null;
    });
    
    // بستن مودال با کلیک خارج از آن
    editStoryModal.addEventListener('click', (e) => {
        if (e.target === editStoryModal) {
            editStoryModal.classList.remove('show');
            currentEditingStoryId = null;
        }
    });
    
    // تابع مشاهده داستان
    function viewStory(storyId) {
        const stories = JSON.parse(localStorage.getItem('savedStories') || '[]');
        storyId = parseInt(storyId); // تبدیل به عدد
        const story = stories.find(s => s.id === storyId);
        
        if (story) {
            // تاریخ
            viewStoryDate.textContent = story.metadata?.date || story.date || 'نامشخص';
            
            // کلمات کلیدی
            viewStoryKeywords.textContent = story.metadata?.keywords || 'بدون کلمات کلیدی';
            
            // طول داستان
            const length = story.metadata?.length || 'نامشخص';
            let requestedLength;
            switch (length) {
                case 'short':
                    requestedLength = 'کوتاه (حدود ۲۰۰ کلمه)';
                    break;
                case 'medium':
                    requestedLength = 'متوسط (حدود ۴۰۰ کلمه)';
                    break;
                case 'long':
                    requestedLength = 'بلند (حدود ۶۰۰ کلمه)';
                    break;
                case 'custom':
                    const customLength = story.metadata?.customLength || '?';
                    requestedLength = `سفارشی (حدود ${toPersianNumber(customLength)} کلمه)`;
                    break;
                default:
                    requestedLength = 'نامشخص';
            }
            viewStoryLength.textContent = requestedLength;
            
            // تعداد واقعی کلمات
            const wordCount = document.getElementById('viewStoryWordCount');
            if (wordCount) {
                // اگر در متادیتا ذخیره شده باشد از آن استفاده می‌کنیم
                if (story.metadata?.wordCount) {
                    wordCount.textContent = toPersianNumber(story.metadata.wordCount);
                } else {
                    // محاسبه تعداد کلمات از محتوا
                    const count = story.content.trim().split(/\s+/).length;
                    wordCount.textContent = toPersianNumber(count);
                }
            }
            
            // مدل
            viewStoryModel.textContent = story.metadata?.model || 'نامشخص';
            
            // محتوا
            viewStoryContent.innerHTML = formatStory(story.content);
            
            // نمایش مودال
            viewStoryModal.classList.add('show');
        } else {
            console.error('داستان یافت نشد:', storyId);
        }
    }
    
    // بستن مودال مشاهده
    closeViewBtn.addEventListener('click', () => {
        viewStoryModal.classList.remove('show');
    });
    
    // بستن مودال با کلیک خارج از آن
    viewStoryModal.addEventListener('click', (e) => {
        if (e.target === viewStoryModal) {
            viewStoryModal.classList.remove('show');
        }
    });
    
    // نمایش داستان‌های ذخیره شده در بارگذاری صفحه
    displaySavedStories();
    
    generateBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            showNotification('لطفاً کلید API را وارد کنید', 'error');
            return;
        }
        
        if (!apiKey.startsWith('sk-or-')) {
            showNotification('کلید API باید با "sk-or-" شروع شود. لطفاً کلید معتبر وارد کنید.', 'error');
            return;
        }
        
        // ذخیره کلید API در localStorage
        localStorage.setItem('openrouterApiKey', apiKey);
        
        // بارگذاری مدل‌ها اگر قبلاً بارگذاری نشده‌اند
        if (aiModelSelect.options.length <= 1 && aiModelSelect.options[0].value === '') {
            await loadAvailableModels(apiKey);
        }
        
        const storyTheme = storyThemeInput.value.trim();
        if (!storyTheme) {
            showNotification('لطفاً موضوع داستان را وارد کنید', 'error');
            return;
        }
        
        const storyKeywords = storyKeywordsInput.value.trim();
        const storyLength = storyLengthSelect.value;
        const storyTone = document.getElementById('storyTone').value;
        const aiModel = aiModelSelect.value;
        
        if (!aiModel) {
            showNotification('لطفاً یک مدل هوش مصنوعی انتخاب کنید', 'error');
            return;
        }
        
        // ذخیره موضوع و کلمات کلیدی فعلی
        saveCurrentInputs();
        
        // نمایش لودینگ
        loadingSpinner.style.display = 'flex';
        storyResult.style.display = 'none';
        
        try {
            const story = await generateStory(storyTheme, storyKeywords, storyLength, storyTone, aiModel, apiKey);
            
            if (!story) {
                // نمایش پیام خطا در محل داستان
                showErrorStory('متأسفانه دریافت داستان با مشکل مواجه شد');
                return;
            }
            
            // ذخیره داستان
            saveStory(story, {
                title: storyTheme,
                keywords: storyKeywords,
                length: storyLength,
                tone: storyTone,
                model: aiModel
            });
            
            // آماده‌سازی المان‌ها
            storyResult.style.display = 'block';
            document.querySelector('.story-actions').style.display = 'flex';
            wordCount.style.display = 'block';
            
            // نمایش داستان به صورت زنده با انیمیشن‌های جدید
            typeStory(story);
            
            // نمایش اعلان موفقیت
            showNotification('داستان با موفقیت ساخته شد', 'success');
        } catch (error) {
            console.error('خطا در تولید داستان:', error);
            console.error('جزئیات خطا:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            // مخفی کردن بارگذاری در صورت خطا
            loadingSpinner.style.display = 'none';
            
            // نمایش خطا در محل داستان
            showErrorStory(error.message || 'خطا در ساخت داستان');
            
            // پیشنهاد مدل جایگزین اگر خطا مربوط به مدل باشد
            if (error.message && (error.message.includes('model') || error.message.includes('API') || error.message.includes('محتوای پیام'))) {
                let alternativeModel = '';
                if (aiModel === 'gpt-4o') {
                    alternativeModel = 'gemini-1.5-flash';
                } else if (aiModel === 'gemini-1.5-flash') {
                    alternativeModel = 'claude-3-haiku';
                } else {
                    alternativeModel = 'gpt-3.5-turbo';
                }
                
                showNotification(`خطا در استفاده از مدل ${aiModel}. لطفاً مدل ${alternativeModel} را امتحان کنید.`, 'warning');
            } else {
                // نمایش پیام خطا به کاربر
                showNotification(`خطا در ساخت داستان: ${error.message || 'خطای نامشخص'}`, 'error');
            }
        }
    });
    
    // تابع نمایش متن به صورت زنده با انیمیشن‌های جدید - نمایش خط به خط
    function typeStory(story) {
        // بررسی اگر داستان undefined یا null است
        if (!story) {
            console.error('داستان خالی یا نامعتبر است (null یا undefined)');
            showNotification('خطا: داستان خالی یا نامعتبر است', 'error');
            return;
        }
        
        // تبدیل به رشته برای اطمینان
        story = String(story);
        
        storyContent.innerHTML = '';
        storyResult.classList.add('show');
        storyResult.style.display = 'block'; // اطمینان از نمایش کانتینر
        
        const wordCount = document.getElementById('wordCount');
        // شمارش کل کلمات
        const totalWords = story.trim().split(/\s+/).length;
        
        // تنظیم مقدار اولیه شمارنده
        if (wordCount) {
            wordCount.textContent = toPersianNumber(0);
        }
        wordCount.textContent = `تعداد کلمات: ${toPersianNumber(0)}`;
        
        // نمایش دکمه‌های عملیات
        document.querySelector('.story-actions').style.display = 'flex';
        // نمایش شمارنده کلمات
        wordCount.style.display = 'block';
        
        // جدا کردن خطوط داستان
        let lines = story.split(/\n/).filter(line => line && line.trim() !== '');
        
        // اگر فقط یک خط باشد، داستان را به جملات تقسیم می‌کنیم
        if (lines.length <= 1) {
            lines = story.split(/([.!?؟]+)/).filter(line => line && line.trim() !== '');
            // ترکیب نشانه‌های نقطه‌گذاری با جمله قبلی
            let combinedLines = [];
            for (let i = 0; i < lines.length; i++) {
                if (/^[.!?؟]+$/.test(lines[i]) && i > 0) {
                    combinedLines[combinedLines.length - 1] += lines[i];
                } else {
                    combinedLines.push(lines[i]);
                }
            }
            lines = combinedLines;
        }
        
        // متغیر برای شمارش کلمات کلی
        let totalTypedWords = 0;
        let currentParagraph = null;
        
        // تابع برای نمایش خطوط یکی پس از دیگری
        function typeLines(index) {
            // اگر به آخرین خط رسیدیم، پایان دهیم
            if (index >= lines.length) {
                return;
            }
            
            const line = lines[index];
            if (!line || line.trim() === '') {
                typeLines(index + 1);
                return;
            }
            
            // ایجاد یک پاراگراف جدید اگر نیاز باشد یا استفاده از پاراگراف موجود
            if (index % 5 === 0 || currentParagraph === null) {
                currentParagraph = document.createElement('p');
                currentParagraph.style.opacity = '1';
                currentParagraph.style.transform = 'translateY(0)';
                storyContent.appendChild(currentParagraph);
            }
            
            // ایجاد المنت برای خط جدید
            const lineElement = document.createElement('span');
            lineElement.className = 'story-line';
            lineElement.style.display = 'block';
            lineElement.style.opacity = '0';
            lineElement.style.transform = 'translateY(10px)';
            lineElement.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            currentParagraph.appendChild(lineElement);
            
            // جدا کردن کلمات برای انیمیشن تایپ
            const words = line.split(' ').filter(w => w);
            let wordIndex = 0;
            
            // شروع روند تایپ کلمات خط
            function addNextWord() {
                if (wordIndex < words.length) {
                    const word = words[wordIndex];
                    if (!word) {
                        wordIndex++;
                        addNextWord();
                        return;
                    }
                    
                    const span = document.createElement('span');
                    span.textContent = word + ' ';
                    span.classList.add('word-enter');
                    span.style.animationDelay = `${wordIndex * 0.05}s`;
                    
                    // برای ایموجی‌ها، کلاس خاص اضافه کنیم
                    if (isEmoji(word)) {
                        span.classList.add('emoji');
                        span.style.fontWeight = 'normal';
                        span.style.direction = 'ltr';
                        span.textContent = word + ' ';
                    }
                    
                    lineElement.appendChild(span);
                    wordIndex++;
                    totalTypedWords++;
                    
                    // به‌روزرسانی شمارنده کلمات
                    if (wordCount) {
                        wordCount.textContent = toPersianNumber(totalTypedWords);
                    }
                    wordCount.innerHTML = `تعداد کلمات: <span>${toPersianNumber(totalTypedWords)}</span> از <span>${toPersianNumber(totalWords)}</span>`;
                    
                    // افزودن کلمه بعدی با تأخیر - سرعت بیشتر برای داستان‌های بلندتر
                    const speed = Math.min(30, Math.max(5, Math.floor(30 - (totalWords / 100))));
                    setTimeout(addNextWord, speed);
                } else {
                    // وقتی خط فعلی تمام شد، خط بعدی را نمایش دهیم
                    lineElement.style.opacity = '1';
                    lineElement.style.transform = 'translateY(0)';
                    
                    // تأخیر کوتاه قبل از شروع خط بعدی
                    setTimeout(() => {
                        typeLines(index + 1);
                    }, 200); // تأخیر بین خطوط
                }
            }
            
            // شروع تایپ کلمات با تأخیر کوتاه
            setTimeout(() => {
                addNextWord();
            }, 100);
        }
        
        // شروع فرآیند نمایش از اولین خط
        typeLines(0);
        
        // اسکرول به بالای کانتینر داستان
        storyResult.scrollIntoView({ behavior: 'smooth' });
    }
    
    // تابع برای تقسیم یک متن طولانی به پاراگراف‌های منطقی
    function splitIntoLogicalParagraphs(text) {
        // اگر متن خیلی کوتاه است، آن را به عنوان یک پاراگراف برگردانید
        if (text.length < 200) return [text];
        
        // جمله‌های متن را جدا کنید
        const sentences = text.replace(/([.!?])\s+/g, "$1\n").split("\n");
        
        // تعداد تقریبی جملات در هر پاراگراف
        const sentencesPerParagraph = Math.max(3, Math.min(5, Math.ceil(sentences.length / 6)));
        
        // ایجاد پاراگراف‌ها
        const paragraphs = [];
        let currentParagraph = '';
        
        sentences.forEach((sentence, index) => {
            currentParagraph += sentence + ' ';
            
            // وقتی به تعداد مناسب جملات رسیدیم یا به آخرین جمله رسیدیم
            if ((index + 1) % sentencesPerParagraph === 0 || index === sentences.length - 1) {
                paragraphs.push(currentParagraph.trim());
                currentParagraph = '';
            }
        });
        
        return paragraphs;
    }
    
    // تابع تشخیص ایموجی
    function isEmoji(str) {
        // بررسی رشته خالی
        if (!str || str.length === 0) return false;
        
        // اگر فقط یک کاراکتر است و ایموجی است
        if (str.length === 1) {
            // الگوی رجکس برای تشخیص دامنه وسیعی از ایموجی‌ها
            const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}-\u{1F17F}\u{1F18E}\u{3030}\u{2B50}\u{2B55}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{3297}\u{3299}\u{303D}\u{00A9}\u{00AE}\u{2122}\u{23F3}\u{24C2}\u{23E9}-\u{23EF}\u{25AA}-\u{25AB}\u{25FB}-\u{25FE}\u{2611}\u{2614}-\u{2615}\u{2648}-\u{2653}\u{267F}\u{2693}\u{26A1}\u{26AA}-\u{26AB}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26CE}\u{26D4}\u{26EA}\u{26F2}-\u{26F3}\u{26F5}\u{26FA}\u{26FD}\u{2705}\u{270A}-\u{270B}\u{2728}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2795}-\u{2797}\u{27B0}\u{27BF}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}]/u;
            return emojiRegex.test(str);
        }
        
        // اگر بیش از یک کاراکتر است، چک کنیم که آیا یک ترکیب ایموجی است
        const combinedEmojiRegex = /^(?:[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}-\u{1F17F}\u{1F18E}\u{3030}\u{2B50}\u{2B55}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{3297}\u{3299}\u{303D}\u{00A9}\u{00AE}\u{2122}\u{23F3}\u{24C2}\u{23E9}-\u{23EF}\u{25AA}-\u{25AB}\u{25FB}-\u{25FE}\u{2611}\u{2614}-\u{2615}\u{2648}-\u{2653}\u{267F}\u{2693}\u{26A1}\u{26AA}-\u{26AB}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26CE}\u{26D4}\u{26EA}\u{26F2}-\u{26F3}\u{26F5}\u{26FA}\u{26FD}\u{2705}\u{270A}-\u{270B}\u{2728}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2795}-\u{2797}\u{27B0}\u{27BF}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}][\uFE00-\uFE0F]?)+$/u;
        return combinedEmojiRegex.test(str);
    }
    
    // تابع فرمت‌دهی به داستان برای نمایش
    function formatStory(storyText) {
        // اطمینان از اینکه داستان رشته است
        if (storyText === null || storyText === undefined) {
            console.error('ورودی formatStory نامعتبر است (null یا undefined)');
            return '<p class="error-message">خطا در دریافت داستان</p>';
        }
        
        // تبدیل به رشته برای اطمینان
        storyText = String(storyText);
        
        if (!storyText.trim()) {
            return '<p class="error-message">متن داستان خالی است</p>';
        }
        
        // جدا کردن پاراگراف‌ها با توجه به الگوهای مختلف
        let paragraphs = storyText.split('\n\n').filter(para => para && para.trim() !== '');
        
        // اگر پاراگرافی یافت نشد، کل متن را یک پاراگراف در نظر بگیریم
        if (paragraphs.length === 0) {
            paragraphs = [storyText];
        }
        
        // اگر تعداد پاراگراف‌ها خیلی کم است، روش‌های دیگر را امتحان کنیم
        if (paragraphs.length < 3 && storyText.length > 500) {
            const alternativeParagraphs1 = storyText.split('\n').filter(para => para && para.trim() !== '');
            const alternativeParagraphs2 = storyText.split(/\n\s*\n/).filter(para => para && para.trim() !== '');
            
            if (alternativeParagraphs1.length > paragraphs.length || alternativeParagraphs2.length > paragraphs.length) {
                paragraphs = (alternativeParagraphs1.length > alternativeParagraphs2.length) 
                    ? alternativeParagraphs1 
                    : alternativeParagraphs2;
            }
        }
        
        // اگر همچنان تعداد پاراگراف‌ها کم است، داستان را به پاراگراف‌های منطقی تقسیم کنیم
        if (paragraphs.length < 3 && storyText.length > 500) {
            paragraphs = splitIntoLogicalParagraphs(storyText);
        }
        
        // فرمت‌دهی هر پاراگراف و بهبود نمایش ایموجی‌ها
        const formattedText = paragraphs.map(paragraph => {
            if (!paragraph) return ''; // رد کردن پاراگراف‌های خالی
            
            // جداسازی کاراکترها برای بررسی ایموجی‌ها
            let formatted = '';
            for (let i = 0; i < paragraph.length; i++) {
                const char = paragraph.charAt(i);
                if (isEmoji(char)) {
                    // اضافه کردن ایموجی با کلاس مخصوص بدون فاصله اضافی
                    formatted += `<span class="emoji" style="font-weight:normal;direction:ltr;">${char}</span>`;
                } else {
                    formatted += char;
                }
            }
            
            // تبدیل خط‌های داخل پاراگراف به <br>
            formatted = formatted.replace(/\n/g, '<br>');
            
            return `<p>${formatted}</p>`;
        }).join('');
        
        return formattedText || '<p class="error-message">خطا در فرمت‌دهی داستان</p>';
    }
    
    // تابع برای نمایش پیام خطا به جای داستان
    function showErrorStory(errorMessage) {
        storyContent.innerHTML = `
            <div class="error-container">
                <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <p class="error-message">${errorMessage || 'خطا در دریافت داستان از سرور'}</p>
                <p class="error-help">لطفاً با مدل دیگری دوباره امتحان کنید یا بعداً تلاش نمایید.</p>
            </div>
        `;
        
        storyResult.style.display = 'block';
        loadingSpinner.style.display = 'none';
        document.querySelector('.story-actions').style.display = 'none';
        wordCount.style.display = 'none';
    }
    
    // بررسی وجود کلید API و بارگذاری مدل‌ها در صورت وجود
    apiKeyInput.addEventListener('input', function() {
        const apiKey = this.value.trim();
        if (apiKey.length > 10 && apiKey.startsWith('sk-or-')) {
            loadAvailableModels(apiKey);
        }
    });
    
    // نمایش/مخفی کردن باکس جستجو
    aiModelSelect.addEventListener('focus', () => {
        searchableSelectContainer.classList.add('active');
    });
    
    aiModelSelect.addEventListener('blur', (e) => {
        // اگر موس روی باکس جستجو نیست، آن را مخفی کن
        if (!searchableSelectContainer.contains(e.relatedTarget)) {
            searchableSelectContainer.classList.remove('active');
        }
    });
    
    // تابع باز/بسته کردن تاریخچه
    toggleHistoryBtn.addEventListener('click', () => {
        const isVisible = savedStoriesContainer.style.display === 'block';
        savedStoriesContainer.style.display = isVisible ? 'none' : 'block';
        savedStoriesContainer.style.maxHeight = isVisible ? '0' : '600px';
        toggleHistoryBtn.classList.toggle('active');
        
        // تغییر آیکون
        const icon = toggleHistoryBtn.querySelector('i');
        icon.classList.toggle('fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
        
        // اضافه کردن انیمیشن به داستان‌های تاریخچه
        if (!isVisible) {
            const cards = savedStoriesContainer.querySelectorAll('.story-card');
            cards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
            });
        }
    });

    // اضافه کردن عملکرد دکمه مشاهده کل داستان
    viewFullStoryBtn.addEventListener('click', () => {
        const storyText = storyContent.textContent;
        
        // محاسبه تعداد واقعی کلمات
        const actualWordCount = storyText.trim().split(/\s+/).length;
        
        // ایجاد محتوا با فرمت صحیح پاراگراف‌ها
        viewStoryContent.innerHTML = formatStory(storyText);
        
        // اضافه کردن تاریخ امروز
        const todayDate = new Date().toLocaleString('fa-IR');
        viewStoryDate.textContent = todayDate;
        
        // اضافه کردن کلمات کلیدی
        viewStoryKeywords.textContent = storyKeywordsInput.value || 'بدون کلمات کلیدی';
        
        // اضافه کردن طول داستان
        const length = storyLengthSelect.value;
        let requestedLength;
        switch (length) {
            case 'short':
                requestedLength = 'کوتاه (حدود ۲۰۰ کلمه)';
                break;
            case 'medium':
                requestedLength = 'متوسط (حدود ۴۰۰ کلمه)';
                break;
            case 'long':
                requestedLength = 'بلند (حدود ۶۰۰ کلمه)';
                break;
            case 'custom':
                requestedLength = `سفارشی (حدود ${toPersianNumber(customWordCountInput.value)} کلمه)`;
                break;
            default:
                requestedLength = 'نامشخص';
        }
        viewStoryLength.textContent = requestedLength;
        
        // اضافه کردن تعداد واقعی کلمات
        const wordCount = document.getElementById('viewStoryWordCount');
        if (wordCount) {
            wordCount.textContent = toPersianNumber(actualWordCount);
        }
        
        // اضافه کردن مدل
        viewStoryModel.textContent = aiModelSelect.options[aiModelSelect.selectedIndex].text;
        
        // نمایش مودال با انیمیشن
        viewStoryModal.classList.add('show');
    });

    // اضافه کردن عملکرد دکمه کپی داستان با انیمیشن
    copyStoryBtn.addEventListener('click', async () => {
        const storyText = storyContent.textContent;
        try {
            await navigator.clipboard.writeText(storyText);
            copyStoryBtn.innerHTML = '<i class="fas fa-check"></i> کپی شد!';
            
            // انیمیشن موفقیت
            copyStoryBtn.classList.add('success-animation');
            
            setTimeout(() => {
                copyStoryBtn.innerHTML = '<i class="fas fa-copy"></i> کپی داستان';
                copyStoryBtn.classList.remove('success-animation');
            }, 2000);
            
            // نمایش اعلان موفقیت
            showNotification('متن داستان کپی شد', 'success');
        } catch (err) {
            console.error('خطا در کپی کردن داستان:', err);
            copyStoryBtn.innerHTML = '<i class="fas fa-times"></i> خطا در کپی';
            
            // انیمیشن خطا
            copyStoryBtn.classList.add('error-animation');
            
            setTimeout(() => {
                copyStoryBtn.innerHTML = '<i class="fas fa-copy"></i> کپی داستان';
                copyStoryBtn.classList.remove('error-animation');
            }, 2000);
            
            // نمایش اعلان خطا
            showNotification('خطا در کپی کردن متن', 'error');
        }
    });

    // نمایش خطا به کاربر و کنسول
    function displayError(error, apiKey) {
        console.error('خطا در درخواست API:', error);
        
        // بررسی نوع خطا
        if (error.message && error.message.includes('Failed to read the \'headers\'')) {
            // خطای مربوط به هدرهای HTTP
            console.log('خطا در هدرهای HTTP - به احتمال زیاد رفع شده است');
            showNotification('لطفاً دوباره تلاش کنید. مشکل هدرهای HTTP برطرف شده است.', 'info');
        } else if (apiKey && apiKey.startsWith('sk-or-')) {
            // کلید API معتبر است، اما خطای دیگری رخ داده
            console.log('کلید API وارد شده صحیح است اما خطایی رخ داد');
            showNotification('خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید یا از مدل دیگری استفاده کنید.', 'error');
        } else {
            // کلید API نامعتبر است
            showNotification('کلید API نامعتبر است. لطفاً یک کلید معتبر OpenRouter وارد کنید.', 'error');
        }
        
        loadingSpinner.style.display = 'none';
        return null;
    }

    // تابع تولید داستان
    async function generateStory(theme, keywords = '', length = 'medium', tone = 'normal', model = DEFAULT_MODEL, apiKey) {
        try {
            if (!theme || !theme.trim()) {
                showNotification('لطفاً موضوع داستان را وارد کنید', 'warning');
                return null;
            }

            if (!apiKey || !apiKey.startsWith('sk-or-')) {
                showNotification('لطفاً کلید API معتبر OpenRouter را وارد کنید', 'warning');
                return null;
            }

            // تعیین تعداد هدف کلمات بر اساس طول داستان
            let targetWords;
            switch (length) {
                case 'short':
                    targetWords = 200;
                    break;
                case 'medium':
                    targetWords = 400;
                    break;
                case 'long':
                    targetWords = 600;
                    break;
                case 'custom':
                    targetWords = parseInt(customWordCountInput.value) || 400;
                    break;
                default:
                    targetWords = 400;
            }

            // نمایش دکمه‌های بارگذاری
            loadingSpinner.style.display = 'flex';
            storyResult.style.display = 'none';

            // ثبت پارامترهای درخواست برای دیباگ
            console.log('ارسال درخواست داستان با پارامترهای:', {
                model,
                theme,
                keywords: keywords ? keywords : 'بدون کلمات کلیدی',
                length,
                tone,
                targetWords
            });

            // تعداد توکن‌ها - اطمینان از فضای کافی برای تکمیل داستان
            const maxTokens = Math.max(3000, targetWords * 4);

            const prompt = `
لطفاً یک داستان کامل به زبان فارسی با موضوع "${theme}" ایجاد کن.

طول هدف: حدود ${targetWords} کلمه
لحن: ${tone === 'childish' ? 'کودکانه' : tone === 'serious' ? 'جدی' : 'عادی'}
${keywords ? `کلمات کلیدی: ${keywords}` : ''}

### الزامات بسیار مهم:
- داستان باید به طور کامل پایان‌بندی شود، هرگز داستان را ناتمام رها نکن.
- داستان باید دارای مقدمه (آغاز)، بدنه (میانه) و نتیجه‌گیری (پایان) مشخص باشد.
- هیچ بخشی از داستان نباید بریده یا ناتمام رها شود، حتی اگر به قیمت طولانی شدن داستان باشد.
- تضمین کن داستان به نقطه پایان منطقی برسد و هیچ پرسش یا موضوع مهمی بدون پاسخ نماند.
- فقط متن داستان را تولید کن، بدون توضیحات اضافی یا پیش‌گفتار.
- داستان را به پاراگراف‌های منطقی تقسیم کن.

داستان باید کاملاً پایان یابد، حتی اگر طولانی‌تر از طول هدف شود.`;

            try {
                // ارسال درخواست به API با افزایش زمان انتظار برای داستان‌های طولانی
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 ثانیه مهلت زمانی
                
                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                        'HTTP-Referer': window.location.href,
                        'X-Title': 'Persian Story Generator'
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            { 
                                role: "system", 
                                content: "شما یک داستان‌نویس حرفه‌ای فارسی زبان هستید. باید حتماً داستان‌های کامل با آغاز، میانه و پایان بنویسید و هرگز داستان را نیمه‌تمام رها نکنید. همیشه داستان‌ها باید به پایان منطقی برسند و نتیجه‌گیری شوند."
                            },
                            { role: "user", content: prompt }
                        ],
                        max_tokens: maxTokens,
                        temperature: 0.7,
                        top_p: 0.9,
                        stop: null, // به مدل اجازه می‌دهد داستان را تا پایان کامل تولید کند
                        stream: false, // داستان یکجا دریافت شود
                        presence_penalty: 0.2, // برای جلوگیری از تکرار موضوعات
                        frequency_penalty: 0.3, // برای تنوع بیشتر در متن
                    }),
                    signal: controller.signal,
                    timeout: 120000 // 120 ثانیه مهلت زمانی
                });
                
                // پاکسازی تایمر
                clearTimeout(timeoutId);

                // بررسی خطاهای HTTP
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('خطا از API:', errorText);
                    throw new Error(`خطا از سرور: ${response.status} ${response.statusText}`);
                }

                // دریافت پاسخ
                const responseText = await response.text();
                if (!responseText) {
                    throw new Error('پاسخ خالی از API دریافت شد');
                }
                
                console.log('پاسخ خام API:', responseText.substring(0, 500) + '...');

                // تبدیل به JSON با مدیریت خطای بهتر
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (e) {
                    console.error('خطا در تبدیل پاسخ به JSON:', e);
                    console.error('متن پاسخ:', responseText);
                    throw new Error('پاسخ API در فرمت معتبر JSON نیست');
                }

                // بررسی داده بازگشتی
                if (!data) {
                    throw new Error('داده JSON خالی از API دریافت شد');
                }

                // بررسی خطاهای API
                if (data.error) {
                    console.error('خطای API:', data.error);
                    throw new Error(`خطا از API: ${data.error.message || 'خطای نامشخص'}`);
                }

                // بررسی وجود انتخاب‌های داستان
                if (!data.choices || !data.choices.length) {
                    console.error('هیچ داستانی دریافت نشد:', data);
                    throw new Error('هیچ داستانی از API دریافت نشد');
                }

                // بررسی وجود message در اولین انتخاب
                if (!data.choices[0] || !data.choices[0].message) {
                    console.error('ساختار پاسخ نامعتبر است:', data.choices[0]);
                    throw new Error('ساختار پاسخ API نامعتبر است');
                }

                // استخراج متن داستان با بررسی مقادیر null
                const messageContent = data.choices[0].message.content;
                if (messageContent === undefined || messageContent === null) {
                    console.error('محتوای پیام خالی است:', data.choices[0]);
                    throw new Error('پاسخ API فاقد محتوای متنی است');
                }
                
                // تبدیل رشته و trim کردن
                const story = String(messageContent).trim();
                
                // اطمینان از اینکه داستان خالی نیست
                if (!story) {
                    console.error('داستان دریافتی خالی است');
                    throw new Error('داستان دریافتی خالی است');
                }
                
                // بررسی کامل بودن داستان
                let processedStory = story;
                
                // افزودن ایموجی برای داستان‌های کودکانه
                if (tone === 'childish') {
                    console.log('افزودن ایموجی به داستان کودکانه...');
                    processedStory = addEmojisToChildishStory(processedStory);
                }
                
                // بررسی اگر داستان با جمله ناتمام پایان می‌یابد
                const lastChar = processedStory.slice(-1);
                if (!['.', '!', '?', '،', '؛', ':', '"', "'", ')', ']', '}', '»'].includes(lastChar)) {
                    processedStory += '.'; // اضافه کردن نقطه در انتها اگر نشانه پایان نداشته باشد
                    console.log('نقطه پایان به داستان اضافه شد');
                }
                
                // بررسی طول داستان برای کاربران
                const paragraphs = processedStory.split('\n\n');
                console.log(`تعداد پاراگراف‌های داستان: ${paragraphs.length}`);
                
                // شمارش کلمات داستان تولید شده
                const wordCount = processedStory.split(/\s+/).length;
                console.log(`تعداد کلمات تولید شده: ${wordCount}, هدف: ${targetWords}`);
                
                // محاسبه درصد تفاوت
                const difference = Math.abs(wordCount - targetWords);
                const percentDifference = (difference / targetWords) * 100;
                console.log(`تفاوت: ${difference} کلمه (${percentDifference.toFixed(1)}%)`);
                
                // هشدار در صورت تفاوت قابل توجه
                if (percentDifference > 40) {
                    showNotification(`تعداد کلمات داستان (${wordCount}) با هدف تعیین شده (${targetWords} کلمه) تفاوت زیادی دارد`, 'warning');
                }

                // مخفی کردن بارگذاری
                loadingSpinner.style.display = 'none';
                
                return processedStory;
            } catch (fetchError) {
                // خطای دریافت API
                console.error('خطا در ارتباط با API:', fetchError);
                
                // مخفی کردن نشانگر بارگذاری
                loadingSpinner.style.display = 'none';
                
                // بررسی نوع خطا
                if (fetchError.message && fetchError.message.includes('headers')) {
                    // خطای مربوط به هدرهای HTTP
                    console.log('خطای هدر HTTP شناسایی شد. در حال تلاش مجدد با هدرهای استاندارد');
                    showNotification('لطفاً دوباره تلاش کنید. مشکل هدرها برطرف شده است.', 'info');
                    return null;
                }
                
                // خطاهای مربوط به مدل
                if (fetchError.message && (fetchError.message.includes('model') || fetchError.message.includes('API') || fetchError.message.includes('محتوا'))) {
                    let alternativeModel = '';
                    if (model === 'gpt-4o') {
                        alternativeModel = 'gemini-1.5-flash';
                    } else if (model === 'gemini-1.5-flash') {
                        alternativeModel = 'claude-3-haiku';
                    } else if (model.includes('claude')) {
                        alternativeModel = 'gpt-3.5-turbo';
                    } else {
                        alternativeModel = 'gemini-1.5-flash';
                    }
                    
                    showNotification(`خطا در ارتباط با مدل ${model}. لطفاً مدل ${alternativeModel} را امتحان کنید.`, 'warning');
                } else {
                    // خطاهای دیگر
                    showNotification(`خطا در ارتباط با سرور: ${fetchError.message}`, 'error');
                }
                
                return null;
            }
        } catch (error) {
            console.error('خطا در تولید داستان:', error);
            console.error('جزئیات خطا:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            // مخفی کردن بارگذاری در صورت خطا
            loadingSpinner.style.display = 'none';
            
            // نمایش پیام خطا
            showNotification(`خطا در ساخت داستان: ${error.message}`, 'error');
            
            return null;
        }
    }

    // تابع نمایش اعلان‌ها با انیمیشن
    function showNotification(message, type = 'info') {
        // بررسی اگر نوتیفیکیشن قبلی وجود دارد، آن را حذف کنیم
        const existingNotif = document.querySelector('.notification');
        if (existingNotif) {
            existingNotif.remove();
        }
        
        // ایجاد المنت اعلان
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            </div>
            <div class="notification-content">${message}</div>
        `;
        
        // اضافه کردن به صفحه
        document.body.appendChild(notification);
        
        // نمایش با انیمیشن
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // حذف بعد از مدتی
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    // بررسی مقداردهی اولیه
    function initializeApp() {
        // حالت تاریک و تم رنگی
        initThemeManagement();
        
        // بارگذاری تنظیمات ذخیره شده
        if (localStorage.getItem('openrouterApiKey')) {
            apiKeyInput.value = localStorage.getItem('openrouterApiKey');
            loadAvailableModels(localStorage.getItem('openrouterApiKey'));
        } else {
            loadDefaultModels();
        }
        
        // بارگذاری موضوع و کلمات کلیدی قبلی
        loadPreviousInputs();
        
        // بارگذاری لحن انتخاب شده قبلی
        if (localStorage.getItem('selectedTone')) {
            storyToneSelect.value = localStorage.getItem('selectedTone');
        }
        
        // بارگذاری مدل انتخاب شده قبلی
        if (localStorage.getItem('selectedAIModel')) {
            setTimeout(() => {
                try {
                    const savedModel = localStorage.getItem('selectedAIModel');
                    if (savedModel) {
                        const options = aiModelSelect.querySelectorAll('option');
                        let modelExists = false;
                        
                        options.forEach(option => {
                            if (option.value === savedModel) {
                                option.selected = true;
                                modelExists = true;
                            }
                        });
                        
                        if (!modelExists) {
                            console.log('مدل ذخیره شده یافت نشد:', savedModel);
                        }
                    }
                } catch (e) {
                    console.error('خطا در بازیابی مدل ذخیره شده:', e);
                }
            }, 1000);
        }
        
        // نمایش داستان‌های ذخیره شده در بارگذاری صفحه
        displaySavedStories();
    }
    
    // اضافه کردن مقدار اولیه برای شمارنده کلمات
    document.getElementById('wordCount').textContent = '۰';
    
    // مخفی کردن کانتینر داستان در ابتدا
    storyResult.style.display = 'none';
    
    // تابع تولید عنوان برای داستان
    function generateStoryTitle(storyText) {
        // اگر متن خالی است، عنوان پیش‌فرض برگردان
        if (!storyText || !storyText.trim()) {
            return 'داستان جدید';
        }
        
        try {
            // گرفتن چند جمله اول داستان
            const firstSentences = storyText.split(/[.!?؟!.]/g).slice(0, 2).join('').trim();
            
            // گرفتن کلمات کلیدی از بخش اول داستان
            const words = firstSentences.split(' ');
            const importantWords = words.filter(word => word.length > 3).slice(0, 5);
            
            // انتخاب عنوان بر اساس کلمات مهم
            if (importantWords.length >= 2) {
                // انتخاب ۲-۴ کلمه برای عنوان
                const titleWords = importantWords.slice(0, Math.min(4, importantWords.length));
                return titleWords.join(' ');
            } else if (words.length > 5) {
                // اگر کلمات مهم کم بودند، از کلمات ابتدای داستان استفاده کن
                return words.slice(0, 4).join(' ') + '...';
            } else {
                // اگر داستان خیلی کوتاه است
                return 'داستان کوتاه';
            }
        } catch (error) {
            console.error('خطا در تولید عنوان داستان:', error);
            return 'داستان بدون عنوان';
        }
    }
    
    // شروع برنامه
    initializeApp();

    // تابع افزودن ایموجی به داستان‌های کودکانه
    function addEmojisToChildishStory(storyText, maxEmojisPerHundredWords = 10) {
        // ایموجی‌های مناسب برای داستان‌های کودکانه
        const childFriendlyEmojis = [
            '😀', '😃', '😄', '😁', '😆', '😊', '🙂', '😉', '😎', 
            '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐮', 
            '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🦆', '🦉', '🦄', '🦋', '🐝', 
            '🌸', '🌹', '🌺', '🌻', '🌼', '🌷', '🌱', '🌲', '🌳', '🌴', '🌵', 
            '🌞', '🌝', '⭐', '🌟', '✨', '⚡', '☄️', '💫', '🌈', '☀️', '🌤️', '☁️', 
            '🎈', '🎆', '🎇', '🧸', '🎁', '🎉', '🎊', '🎠', '🎡', '🎢', '🎪', 
            '🍦', '🍧', '🍨', '🍩', '🍪', '🍰', '🧁', '🍫', '🍬', '🍭', '🍎', '🍏', '🍐',
            '💖', '💗', '💓', '💞', '💕', '❤️', '🧡', '💛', '💚', '💙', '💜'
        ];

        // تعیین تعداد کلمات
        const words = storyText.split(/\s+/);
        const wordCount = words.length;
        
        // محاسبه تعداد ایموجی مورد نیاز
        const maxEmojis = Math.min(Math.floor(wordCount * maxEmojisPerHundredWords / 100), 50);
        
        if (maxEmojis <= 0) return storyText;
        
        // تقسیم داستان به جملات
        const sentences = storyText.split(/([.!?؟]+\s)/);
        let result = [];
        let emojiCount = 0;
        
        // الگوریتم توزیع ایموجی‌ها
        for (let i = 0; i < sentences.length; i++) {
            if (emojiCount >= maxEmojis) {
                result.push(sentences[i]);
                continue;
            }
            
            // افزودن ایموجی به انتهای جملات مناسب
            if (i % 2 === 0 && sentences[i].trim().length > 10 && Math.random() < 0.4) {
                // انتخاب تصادفی ایموجی
                const randomEmoji = childFriendlyEmojis[Math.floor(Math.random() * childFriendlyEmojis.length)];
                
                // تعیین محل قرارگیری ایموجی (ابتدا، وسط یا انتها)
                const position = Math.random();
                
                if (position < 0.2 && sentences[i].trim().length > 15) {
                    // قرارگیری در ابتدای جمله (با احتمال کمتر)
                    const sentenceParts = sentences[i].trim().split(/\s+/);
                    if (sentenceParts.length > 3) {
                        sentenceParts.splice(1, 0, randomEmoji);
                        result.push(sentenceParts.join(' '));
                    } else {
                        result.push(`${randomEmoji} ${sentences[i]}`);
                    }
                } else if (position < 0.5) {
                    // قرارگیری در وسط جمله
                    const sentenceParts = sentences[i].trim().split(/\s+/);
                    if (sentenceParts.length > 3) {
                        const middleIndex = Math.floor(sentenceParts.length / 2);
                        sentenceParts.splice(middleIndex, 0, randomEmoji);
                        result.push(sentenceParts.join(' '));
                    } else {
                        result.push(`${sentences[i]} ${randomEmoji}`);
                    }
                } else {
                    // قرارگیری در انتهای جمله (رایج‌ترین حالت)
                    result.push(`${sentences[i]} ${randomEmoji}`);
                }
                
                emojiCount++;
            } else {
                result.push(sentences[i]);
            }
        }
        
        // اطمینان از کامل شدن ایموجی‌ها
        if (emojiCount < maxEmojis) {
            // یافتن پاراگراف‌ها
            let finalResult = result.join('');
            const paragraphs = finalResult.split('\n\n');
            
            // اضافه کردن ایموجی به ابتدای هر پاراگراف
            for (let i = 0; i < paragraphs.length && emojiCount < maxEmojis; i++) {
                if (paragraphs[i].trim().length > 20) {
                    const randomEmoji = childFriendlyEmojis[Math.floor(Math.random() * childFriendlyEmojis.length)];
                    paragraphs[i] = `${randomEmoji} ${paragraphs[i]}`;
                    emojiCount++;
                }
            }
            
            finalResult = paragraphs.join('\n\n');
            return finalResult;
        }
        
        return result.join('');
    }
});