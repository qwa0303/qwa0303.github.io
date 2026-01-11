// 社区系统 - 适配新首页结构
const CommunitySystem = {
    // 数据存储键名
    STORAGE_KEYS: {
        USERS: 'community_users',
        POSTS: 'community_posts',
        COMMENTS: 'community_comments',
        SESSIONS: 'community_session'
    },
    
    // 初始化数据
    init() {
        console.log('社区系统初始化开始...');
        
        // 🔥 重要：保留下面这行的注释，不要删除数据！
        // localStorage.clear(); // 仅在需要清空数据时使用
        
        // 初始化默认数据（如果不存在）
        if (!localStorage.getItem(this.STORAGE_KEYS.USERS) || 
            JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS) || '[]').length === 0) {
            this.initializeSampleData();
        }
        
        // 检查数据状态
        const users = this.getUsers();
        console.log('当前用户数量:', users.length);
        console.log('当前用户列表:', users.map(u => ({username: u.username, id: u.id})));
        
        // 初始化登录/注册按钮
        this.initAuthButtons();
    
        // 检查登录状态
        this.checkLoginStatus();
        
        // 根据当前页面加载不同内容
        this.loadPageSpecificContent();
        
        // 渲染用户面板
        this.renderUserPanel();
        
        // 初始化搜索功能
        this.initSearch();
        
        // 初始化发帖按钮
        this.initCreatePostButton();
        
        console.log('社区系统初始化完成');
        console.log('当前登录状态:', this.getCurrentUser() ? '已登录' : '未登录');
    },
    
    // 初始化示例数据 - 修复版本
    initializeSampleData() {
        console.log('初始化示例数据...');
        
        // 创建一个简单的密码哈希（不使用时间戳，确保一致）
        const hashPassword = (password) => {
            return btoa('SALT_' + password);
        };
        
        // 创建测试用户
        const testUser = {
            id: 1,
            username: '测试用户',
            email: 'test@example.com',
            password: hashPassword('123456'),
            avatar: 'https://ui-avatars.com/api/?name=测试用户&background=4CAF50&color=fff',
            bio: '这是一个测试用户，用于演示功能',
            joinDate: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            role: 'user',
            posts: [101, 102, 103],
            followers: [],
            following: []
        };
        
        // 创建测试帖子
        const testPosts = [
            {
                id: 101,
                userId: 1,
                content: '欢迎来到CodeHub社区！这是一个基于HTML5UP模板构建的编程学习社区。\n\n在这里，你可以：\n1. 分享技术文章\n2. 提出编程问题\n3. 交流学习心得\n4. 展示个人项目\n\n欢迎大家积极参与！',
                tags: ['欢迎', '社区', '编程'],
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                likes: [1],
                comments: [],
                views: 25
            },
            {
                id: 102,
                userId: 1,
                content: 'JavaScript学习路线推荐：\n1. 基础语法（变量、函数、对象）\n2. DOM操作\n3. 异步编程（Promise、async/await）\n4. ES6+新特性\n5. 框架学习（Vue/React）\n\n大家有什么补充吗？',
                tags: ['JavaScript', '学习路线', '前端'],
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                likes: [1],
                comments: [],
                views: 18
            },
            {
                id: 103,
                userId: 1,
                content: '问：如何快速入门Python数据分析？需要学习哪些库？',
                tags: ['Python', '数据分析', '问题'],
                timestamp: new Date().toISOString(),
                likes: [],
                comments: [],
                views: 12
            }
        ];
        
        // 保存到localStorage
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify([testUser]));
        localStorage.setItem(this.STORAGE_KEYS.POSTS, JSON.stringify(testPosts));
        localStorage.setItem(this.STORAGE_KEYS.COMMENTS, JSON.stringify([]));
        
        console.log('社区数据已初始化：');
        console.log('- 1个测试用户：用户名="测试用户"，密码="123456"');
        console.log('- 3个测试帖子');
    },
    
    // 初始化按钮
    initAuthButtons() {
        console.log('初始化登录注册按钮...');
        
        // 绑定导航栏的登录/注册按钮
        const navAuthBtn = document.querySelector('.nav-actions .btn-outline');
        if (navAuthBtn && !navAuthBtn.hasAttribute('data-bound')) {
            navAuthBtn.setAttribute('data-bound', 'true');
            navAuthBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('导航栏登录按钮被点击');
                this.showAuthModal('login');
            });
        }
        
        // 绑定英雄区的加入社区按钮
        const heroAuthBtn = document.querySelector('.hero-actions .btn-primary');
        if (heroAuthBtn && heroAuthBtn.textContent.includes('加入社区') && !heroAuthBtn.hasAttribute('data-bound')) {
            heroAuthBtn.setAttribute('data-bound', 'true');
            heroAuthBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('英雄区注册按钮被点击');
                this.showAuthModal('register');
            });
        }
        
        // 绑定其他登录/注册按钮
        const otherAuthBtns = document.querySelectorAll('[onclick*="showAuthModal"]');
        otherAuthBtns.forEach(btn => {
            if (!btn.hasAttribute('data-bound')) {
                btn.setAttribute('data-bound', 'true');
                const match = btn.getAttribute('onclick').match(/showAuthModal\('?(login|register)?'?\)/);
                const type = match ? (match[1] || 'login') : 'login';
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showAuthModal(type);
                });
            }
        });
    },
           
    // 加载页面特定内容
    loadPageSpecificContent() {
        console.log('加载页面特定内容...');
        
        // 首页（index.html）功能
        if (document.getElementById('hotPosts')) {
            this.loadHotPosts();
        }
        
        if (document.getElementById('newArticles')) {
            this.loadNewArticles();
        }
        
        if (document.getElementById('onlineUsers')) {
            this.loadOnlineUsers();
        }
        
        // 社区页面（如果有postsContainer）
        if (document.getElementById('postsContainer')) {
            this.loadPosts();
        }
        
        // 新增：文章、问答、项目区域
        if (document.getElementById('articlesContainer')) {
            this.loadArticles();
        }
        
        if (document.getElementById('questionsContainer')) {
            this.loadQuestions();
        }
        
        if (document.getElementById('projectsContainer')) {
            this.loadProjects();
        }
    },
    
    // 初始化搜索功能
    initSearch() {
        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const searchInput = searchForm.querySelector('input[type="search"], input[type="text"]');
                if (searchInput) {
                    const keyword = searchInput.value.trim();
                    if (keyword) {
                        this.handleSearch(keyword);
                    }
                }
            });
        }
    },
    
    // 初始化发帖按钮
    initCreatePostButton() {
        const createPostBtn = document.getElementById('createPostBtn');
        if (createPostBtn) {
            createPostBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showCreatePostModal();
            });
        }
        
        // 绑定其他发帖按钮
        const postBtns = document.querySelectorAll('[onclick*="showCreatePostModal"]');
        postBtns.forEach(btn => {
            if (!btn.hasAttribute('data-bound')) {
                btn.setAttribute('data-bound', 'true');
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showCreatePostModal();
                });
            }
        });
    },
    
    // 处理搜索
    handleSearch(keyword) {
        if (window.location.pathname.includes('search.html')) {
            this.showSearchResults(keyword);
        } else {
            this.showSearchResultsInline(keyword);
        }
    },
    
    // 在页面中显示搜索结果
    showSearchResultsInline(keyword) {
        const results = this.searchPosts(keyword);
        const users = this.getUsers();
        
        let resultsContainer = document.getElementById('searchResultsContainer');
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.id = 'searchResultsContainer';
            resultsContainer.className = 'search-results-container';
            
            const mainContent = document.querySelector('.community-content, main, .container');
            if (mainContent) {
                mainContent.parentNode.insertBefore(resultsContainer, mainContent);
            } else {
                document.body.appendChild(resultsContainer);
            }
        }
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-results">
                    <h3>搜索："${keyword}"</h3>
                    <div class="empty-state">
                        <div class="empty-icon">🔍</div>
                        <h4>没有找到相关帖子</h4>
                        <p>试试其他关键词，或者发布一个新帖子</p>
                        <button onclick="CommunitySystem.showCreatePostModal()" class="btn btn-primary">
                            发布新帖子
                        </button>
                    </div>
                </div>
            `;
            return;
        }
        
        resultsContainer.innerHTML = `
            <div class="search-results">
                <h3>搜索结果："${keyword}"（${results.length}个）</h3>
                <div class="posts-list">
                    ${results.map(post => {
                        const author = users.find(u => u.id === post.userId);
                        const commentCount = post.comments.length;
                        const likeCount = post.likes.length;
                        
                        return `
                            <div class="post-item search-result-item">
                                <div class="post-header">
                                    <img src="${author?.avatar || 'https://ui-avatars.com/api/?name=User'}" 
                                         alt="${author?.username || '用户'}" 
                                         class="post-avatar">
                                    <div class="post-meta">
                                        <div class="post-author">${author?.username || '未知用户'}</div>
                                        <div class="post-time">${this.formatTime(post.timestamp)}</div>
                                    </div>
                                </div>
                                <div class="post-content-short">
                                    ${this.highlightText(post.content, keyword)}
                                </div>
                                ${post.tags.length > 0 ? `
                                    <div class="post-tags">
                                        ${post.tags.map(tag => `
                                            <span class="tag ${tag.toLowerCase().includes(keyword.toLowerCase()) ? 'tag-highlight' : ''}">
                                                ${tag}
                                            </span>
                                        `).join('')}
                                    </div>
                                ` : ''}
                                <div class="post-stats">
                                    <span class="stat-item">👍 ${likeCount}</span>
                                    <span class="stat-item">💬 ${commentCount}</span>
                                    <span class="stat-item">👁️ ${post.views || 0}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },
    
    // 搜索帖子
    searchPosts(keyword) {
        if (!keyword || keyword.trim().length === 0) {
            return [];
        }
        
        const searchTerm = keyword.toLowerCase().trim();
        const posts = this.getPosts();
        const users = this.getUsers();
        
        return posts.filter(post => {
            const author = users.find(u => u.id === post.userId);
            const authorName = author?.username || '';
            
            if (post.content.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            if (post.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
                return true;
            }
            
            if (authorName.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            return false;
        });
    },
    
    // 高亮显示搜索关键词
    highlightText(text, keyword) {
        if (!keyword || !text) return text;
        
        const regex = new RegExp(`(${keyword})`, 'gi');
        return text.replace(regex, '<mark class="search-highlight">$1</mark>');
    },
    
    // 加载热门帖子
    loadHotPosts() {
        const posts = this.getPosts();
        const users = this.getUsers();
        const container = document.getElementById('hotPosts');
        
        if (!container) return;
        
        if (posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3>欢迎来到社区！</h3>
                    <p>还没有人发布帖子，快来第一个分享吧！</p>
                    <button onclick="CommunitySystem.showCreatePostModal()" class="btn btn-primary">
                        发布第一个帖子
                    </button>
                </div>
            `;
            return;
        }
        
        const hotPosts = [...posts]
            .sort((a, b) => {
                const scoreA = a.likes.length + a.comments.length + (a.views || 0) / 10;
                const scoreB = b.likes.length + b.comments.length + (b.views || 0) / 10;
                return scoreB - scoreA;
            })
            .slice(0, 5);
        
        container.innerHTML = hotPosts.map(post => {
            const author = users.find(u => u.id === post.userId);
            const commentCount = post.comments.length;
            const likeCount = post.likes.length;
            
            return `
                <div class="post-item">
                    <div class="post-header">
                        <img src="${author?.avatar || 'https://ui-avatars.com/api/?name=User'}" 
                             alt="${author?.username || '用户'}" 
                             class="post-avatar">
                        <div class="post-meta">
                            <div class="post-author">${author?.username || '未知用户'}</div>
                            <div class="post-time">${this.formatTime(post.timestamp)}</div>
                        </div>
                    </div>
                    <div class="post-content-short">${this.truncateText(post.content, 100)}</div>
                    <div class="post-stats">
                        <span class="stat-item">👍 ${likeCount}</span>
                        <span class="stat-item">💬 ${commentCount}</span>
                        <span class="stat-item">👁️ ${post.views || 0}</span>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // 加载最新文章
    loadNewArticles() {
        const posts = this.getPosts();
        const users = this.getUsers();
        const container = document.getElementById('newArticles');
        
        if (!container) return;
        
        if (posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📚</div>
                    <h3>期待你的第一篇文章</h3>
                    <p>成为社区的第一个内容创作者！</p>
                    <button onclick="CommunitySystem.showCreatePostModal()" class="btn btn-outline">
                        开始写作
                    </button>
                </div>
            `;
            return;
        }
        
        const newPosts = [...posts]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);
        
        container.innerHTML = newPosts.map(post => {
            const author = users.find(u => u.id === post.userId);
            
            return `
                <div class="article-item">
                    <h4 class="article-title">${this.truncateText(post.content.split('\n')[0], 50)}</h4>
                    <div class="article-meta">
                        <span>👤 ${author?.username || '未知用户'}</span>
                        <span>🕐 ${this.formatTime(post.timestamp)}</span>
                    </div>
                    <p class="article-excerpt">${this.truncateText(post.content, 80)}</p>
                    <div class="article-tags">
                        ${post.tags.map(tag => `<span class="tag-small">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // 加载在线用户
    loadOnlineUsers() {
        const container = document.getElementById('onlineUsers');
        if (!container) return;
        
        const users = this.getUsers();
        
        if (users.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">👤</div>
                    <h3>成为第一个成员</h3>
                    <p>注册后你的头像会显示在这里</p>
                    <button onclick="CommunitySystem.showAuthModal('register')" class="btn btn-primary">
                        立即注册
                    </button>
                </div>
            `;
            return;
        }
        
        const onlineUsers = users
            .sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive))
            .slice(0, 5);
        
        container.innerHTML = onlineUsers.map(user => `
            <div class="user-item">
                <img src="${user.avatar}" alt="${user.username}" class="user-avatar">
                <div class="user-info">
                    <h4>${user.username}</h4>
                    <p>${user.bio || '还没有个人简介'}</p>
                </div>
            </div>
        `).join('');
    },
    
    // 加载帖子
    loadPosts() {
        const posts = this.getPosts();
        const users = this.getUsers();
        const container = document.getElementById('postsContainer');
        
        if (!container) return;
        
        if (posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💬</div>
                    <h3>这里好安静...</h3>
                    <p>还没有人发表内容，快来第一个发言吧！</p>
                    <div class="empty-actions">
                        <button onclick="CommunitySystem.showAuthModal('register')" class="btn btn-outline">
                            注册账号
                        </button>
                        <button onclick="CommunitySystem.showCreatePostModal()" class="btn btn-primary">
                            发布第一个帖子
                        </button>
                    </div>
                </div>
            `;
            return;
        }
        
        posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        container.innerHTML = posts.map(post => {
            const author = users.find(u => u.id === post.userId);
            const commentCount = post.comments.length;
            const likeCount = post.likes.length;
            const currentUser = this.getCurrentUser();
            const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
            
            return `
                <div class="post-card" data-post-id="${post.id}">
                    <div class="post-header">
                        <img src="${author?.avatar || 'https://ui-avatars.com/api/?name=User'}" 
                             alt="${author?.username || '用户'}" 
                             class="post-avatar">
                        <div class="post-meta">
                            <div class="post-author">${author?.username || '未知用户'}</div>
                            <div class="post-time">${this.formatTime(post.timestamp)}</div>
                        </div>
                    </div>
                    
                    <div class="post-content">${this.formatPostContent(post.content)}</div>
                    
                    ${post.tags.length > 0 ? `
                        <div class="post-tags">
                            ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="post-footer">
                        <div class="post-actions-sm">
                            <button class="action-btn ${isLiked ? 'liked' : ''}" 
                                    onclick="CommunitySystem.toggleLike(${post.id})">
                                <i class="fas fa-heart"></i>
                                <span>${likeCount}</span>
                            </button>
                            <button class="action-btn" onclick="CommunitySystem.showComments(${post.id})">
                                <i class="fas fa-comment"></i>
                                <span>${commentCount}</span>
                            </button>
                        </div>
                        <div class="comment-count">${commentCount} 条评论</div>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // 加载文章
    loadArticles() {
        const posts = this.getPosts();
        const users = this.getUsers();
        const container = document.getElementById('articlesContainer');
        
        if (!container) return;
        
        const articles = posts.filter(post => 
            post.tags.includes('文章') || 
            post.content.length > 200
        );
        
        if (articles.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3>暂无技术文章</h3>
                    <p>快来发布第一篇文章，分享你的技术见解！</p>
                    <button onclick="CommunitySystem.showCreatePostModal()" class="btn btn-primary">
                        发布文章
                    </button>
                </div>
            `;
            return;
        }
        
        articles.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        container.innerHTML = articles.map(post => {
            const author = users.find(u => u.id === post.userId);
            const commentCount = post.comments.length;
            const likeCount = post.likes.length;
            
            return `
                <div class="post-item">
                    <div class="post-header">
                        <img src="${author?.avatar || 'https://ui-avatars.com/api/?name=User'}" 
                             alt="${author?.username || '用户'}" 
                             class="post-avatar">
                        <div class="post-meta">
                            <div class="post-author">${author?.username || '未知用户'}</div>
                            <div class="post-time">${this.formatTime(post.timestamp)}</div>
                        </div>
                    </div>
                    <h4 class="article-title">${this.truncateText(post.content.split('\n')[0], 60)}</h4>
                    <div class="post-content-short">${this.truncateText(post.content, 150)}</div>
                    <div class="post-stats">
                        <span class="stat-item">👍 ${likeCount}</span>
                        <span class="stat-item">💬 ${commentCount}</span>
                        <span class="stat-item">👁️ ${post.views || 0}</span>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // 加载问答
    loadQuestions() {
        const posts = this.getPosts();
        const users = this.getUsers();
        const container = document.getElementById('questionsContainer');
        
        if (!container) return;
        
        const questions = posts.filter(post => 
            post.tags.includes('问答') || 
            post.tags.includes('问题') ||
            post.content.includes('？') ||
            post.content.includes('?')
        );
        
        if (questions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">❓</div>
                    <h3>暂无技术问答</h3>
                    <p>有技术问题？快来提问吧！</p>
                    <button onclick="CommunitySystem.showCreatePostModal()" class="btn btn-primary">
                        提出问题
                    </button>
                </div>
            `;
            return;
        }
        
        questions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        container.innerHTML = questions.map(post => {
            const author = users.find(u => u.id === post.userId);
            const commentCount = post.comments.length;
            const likeCount = post.likes.length;
            
            return `
                <div class="post-item">
                    <div class="post-header">
                        <img src="${author?.avatar || 'https://ui-avatars.com/api/?name=User'}" 
                             alt="${author?.username || '用户'}" 
                             class="post-avatar">
                        <div class="post-meta">
                            <div class="post-author">${author?.username || '未知用户'}</div>
                            <div class="post-time">${this.formatTime(post.timestamp)}</div>
                        </div>
                    </div>
                    <div class="post-content-short">
                        <strong>问题：</strong>${this.truncateText(post.content, 100)}
                    </div>
                    <div class="post-stats">
                        <span class="stat-item">👍 ${likeCount}</span>
                        <span class="stat-item">💬 ${commentCount}</span>
                        <span class="stat-item">👁️ ${post.views || 0}</span>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // 加载项目
    loadProjects() {
        const container = document.getElementById('projectsContainer');
        if (!container) return;
        
        const projects = [
            {
                id: 1,
                title: "CodeHub 社区系统",
                description: "基于HTML5UP模板构建的编程学习社区，包含用户系统、帖子管理、评论互动等功能。",
                tech: ["HTML5", "CSS3", "JavaScript", "LocalStorage"],
                github: "https://github.com/qwa0303",
                demo: "index.html"
            },
            {
                id: 2,
                title: "个人博客系统",
                description: "基于Miniport模板的个人技术博客，支持文章展示、项目展示、联系方式等功能。",
                tech: ["HTML5", "CSS3", "JavaScript"],
                github: "https://github.com/qwa0303",
                demo: "personal.html"
            },
            {
                id: 3,
                title: "技术学习笔记",
                description: "整理和分享编程学习过程中的笔记和心得，涵盖Python、C++、前端开发等方向。",
                tech: ["Python", "C++", "前端开发"],
                github: "https://github.com/qwa0303",
                demo: "#"
            }
        ];
        
        container.innerHTML = projects.map(project => `
            <div class="project-card">
                <h4 class="project-title">${project.title}</h4>
                <p class="project-description">${project.description}</p>
                <div class="project-tech">
                    ${project.tech.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                <div class="project-links">
                    <a href="${project.github}" target="_blank" class="project-link github">
                        GitHub
                    </a>
                    <a href="${project.demo}" class="project-link">
                        查看演示
                    </a>
                </div>
            </div>
        `).join('');
    },
    
    // 渲染用户面板
    renderUserPanel() {
        const container = document.getElementById('userPanel');
        if (!container) return;
        
        const user = this.getCurrentUser();
        console.log('渲染用户面板，当前用户:', user ? user.username : '未登录');
        
        if (user) {
            container.innerHTML = `
                <div class="user-avatar-lg">
                    <img src="${user.avatar}" alt="${user.username}" onerror="this.src='https://ui-avatars.com/api/?name=${user.username}&background=4CAF50&color=fff'">
                </div>
                <h3>${user.username}</h3>
                <p class="user-bio">${user.bio || '还没有个人简介'}</p>
                <div class="user-stats">
                    <span>帖子: ${user.posts?.length || 0}</span>
                    <span>粉丝: ${user.followers?.length || 0}</span>
                </div>
                <div class="user-actions">
                    <button onclick="CommunitySystem.showCreatePostModal()" class="btn btn-primary">
                        <i class="fas fa-plus"></i> 发帖
                    </button>
                    <button onclick="CommunitySystem.logout()" class="btn btn-outline">退出</button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="auth-prompt">
                    <h3>加入社区</h3>
                    <p>登录后可以发布帖子、评论互动</p>
                    <div class="auth-buttons">
                        <button onclick="CommunitySystem.showAuthModal('login')" class="btn btn-outline">登录</button>
                        <button onclick="CommunitySystem.showAuthModal('register')" class="btn btn-primary">注册</button>
                    </div>
                </div>
            `;
        }
    },
    
    // 显示登录/注册模态框
    showAuthModal(type = 'login') {
        console.log('显示认证模态框，类型:', type);
        
        const modal = document.getElementById('authModal');
        if (!modal) {
            console.error('未找到authModal元素');
            alert('请先注册/登录');
            return;
        }
        
        const modalContent = modal.querySelector('.modal-content') || modal;
        
        if (type === 'login') {
            modalContent.innerHTML = `
                <div class="auth-form">
                    <h2>用户登录</h2>
                    <form id="loginForm">
                        <div class="form-group">
                            <input type="text" 
                                   placeholder="用户名或邮箱" 
                                   class="form-input"
                                   id="authUsername"
                                   value="测试用户"
                                   required>
                        </div>
                        <div class="form-group">
                            <input type="password" 
                                   placeholder="密码" 
                                   class="form-input"
                                   id="authPassword"
                                   value="123456"
                                   required>
                        </div>
                        <button type="button" onclick="CommunitySystem.handleLogin()" class="btn btn-primary btn-block">登录</button>
                    </form>
                    <p class="auth-switch">
                        还没有账号？ 
                        <a href="#" onclick="CommunitySystem.showAuthModal('register')">立即注册</a>
                    </p>
                    <div class="test-account" style="margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
                        <small>测试账号已预填，直接点击登录即可</small>
                    </div>
                </div>
            `;
        } else {
            modalContent.innerHTML = `
                <div class="auth-form">
                    <h2>用户注册</h2>
                    <form id="registerForm">
                        <div class="form-group">
                            <input type="text" 
                                   placeholder="用户名" 
                                   class="form-input"
                                   id="regUsername"
                                   minlength="3"
                                   required>
                        </div>
                        <div class="form-group">
                            <input type="email" 
                                   placeholder="邮箱" 
                                   class="form-input"
                                   id="regEmail"
                                   required>
                        </div>
                        <div class="form-group">
                            <input type="password" 
                                   placeholder="密码" 
                                   class="form-input"
                                   id="regPassword"
                                   minlength="6"
                                   required>
                        </div>
                        <div class="form-group">
                            <textarea placeholder="个人简介（可选）" 
                                      class="form-input"
                                      id="regBio"
                                      rows="2"></textarea>
                        </div>
                        <button type="button" onclick="CommunitySystem.handleRegister()" class="btn btn-primary btn-block">注册</button>
                    </form>
                    <p class="auth-switch">
                        已有账号？ 
                        <a href="#" onclick="CommunitySystem.showAuthModal('login')">立即登录</a>
                    </p>
                </div>
            `;
        }
        
        modal.style.display = 'block';
        
        modal.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    },
    
    // 处理登录 - 修复版本
    handleLogin() {
        console.log('处理登录...');
        
        const username = document.getElementById('authUsername')?.value;
        const password = document.getElementById('authPassword')?.value;
        
        if (!username || !password) {
            alert('请输入用户名和密码');
            return;
        }
        
        console.log('尝试登录，用户名:', username, '密码长度:', password.length);
        
        try {
            const result = this.login(username, password);
            if (result) {
                console.log('登录成功，用户:', result.username);
                
                const modal = document.getElementById('authModal');
                if (modal) modal.style.display = 'none';
                
                this.renderUserPanel();
                this.loadPageSpecificContent();
                
                // 显示欢迎消息
                setTimeout(() => {
                    alert(`欢迎回来，${result.username}！`);
                }, 100);
            } else {
                alert('登录失败，请检查用户名和密码');
            }
        } catch (error) {
            console.error('登录错误:', error);
            alert('登录失败: ' + error.message);
        }
    },
    
    // 处理注册 - 修复版本
    handleRegister() {
        console.log('处理注册...');
        
        const userData = {
            username: document.getElementById('regUsername')?.value,
            email: document.getElementById('regEmail')?.value,
            password: document.getElementById('regPassword')?.value,
            bio: document.getElementById('regBio')?.value
        };
        
        if (!userData.username || !userData.email || !userData.password) {
            alert('请填写所有必填字段');
            return;
        }
        
        if (userData.username.length < 3) {
            alert('用户名至少3个字符');
            return;
        }
        
        if (userData.password.length < 6) {
            alert('密码至少6个字符');
            return;
        }
        
        console.log('注册用户数据:', { ...userData, password: '***' });
        
        try {
            const newUser = this.register(userData);
            if (newUser) {
                console.log('注册成功，用户ID:', newUser.id);
                
                const modal = document.getElementById('authModal');
                if (modal) modal.style.display = 'none';
                
                this.renderUserPanel();
                this.loadPageSpecificContent();
                
                setTimeout(() => {
                    alert(`欢迎加入社区，${newUser.username}！`);
                }, 100);
            } else {
                alert('注册失败');
            }
        } catch (error) {
            console.error('注册错误:', error);
            alert('注册失败: ' + error.message);
        }
    },
    
    // 创建新帖子
    createPost(content, tags = []) {
        const user = this.getCurrentUser();
        if (!user) {
            alert('请先登录才能发帖');
            this.showAuthModal('login');
            return null;
        }
        
        if (!content || content.trim().length === 0) {
            alert('帖子内容不能为空');
            return null;
        }
        
        if (content.trim().length < 10) {
            alert('帖子内容至少10个字符');
            return null;
        }
        
        const processedTags = Array.isArray(tags) 
            ? tags 
            : typeof tags === 'string' 
                ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                : [];
        
        if (processedTags.length > 5) {
            alert('最多只能添加5个标签');
            return null;
        }
        
        const posts = this.getPosts();
        const users = this.getUsers();
        
        const newPost = {
            id: Date.now(),
            userId: user.id,
            content: content.trim(),
            tags: processedTags,
            timestamp: new Date().toISOString(),
            likes: [],
            comments: [],
            views: 0
        };
        
        console.log('创建新帖子:', newPost);
        posts.push(newPost);
        this.savePosts(posts);
        
        const updatedUsers = users.map(u => {
            if (u.id === user.id) {
                return {
                    ...u,
                    posts: [...(u.posts || []), newPost.id],
                    lastActive: new Date().toISOString()
                };
            }
            return u;
        });
        
        this.saveUsers(updatedUsers);
        
        const updatedUser = updatedUsers.find(u => u.id === user.id);
        if (updatedUser) {
            const session = JSON.parse(localStorage.getItem('community_session') || 'null');
            if (session) {
                localStorage.setItem('community_session', JSON.stringify({
                    ...session,
                    userId: updatedUser.id,
                    username: updatedUser.username
                }));
            }
        }
        
        console.log('帖子创建成功，重新加载页面内容');
        this.loadPageSpecificContent();
        this.renderUserPanel();
        
        setTimeout(() => {
            alert('帖子发布成功！');
        }, 100);
        
        return newPost;
    },
    
    // 显示发帖模态框
    showCreatePostModal() {
        const user = this.getCurrentUser();
        if (!user) {
            alert('请先登录才能发帖');
            this.showAuthModal('login');
            return;
        }
        
        const modal = document.getElementById('postModal') || this.createPostModal();
        
        const modalContent = modal.querySelector('.modal-content') || modal;
        
        modalContent.innerHTML = `
            <div class="post-form">
                <h2>发布新帖子</h2>
                <form id="createPostForm">
                    <div class="form-group">
                        <textarea 
                            id="postContent" 
                            class="form-input" 
                            rows="6" 
                            placeholder="分享你的想法、问题或经验..."
                            required
                            autofocus></textarea>
                    </div>
                    <div class="form-group">
                        <input 
                            type="text" 
                            id="postTags" 
                            class="form-input" 
                            placeholder="添加标签，用逗号分隔（例如：编程,学习,分享）">
                        <small class="form-hint">最多5个标签，每个标签不超过10个字符</small>
                    </div>
                    <div class="form-actions">
                        <button type="button" onclick="this.closest('.modal').style.display='none'" 
                                class="btn btn-outline">取消</button>
                        <button type="button" onclick="CommunitySystem.handleCreatePost()" class="btn btn-primary">
                            <i class="fas fa-paper-plane"></i> 发布
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        modal.style.display = 'block';
        
        modal.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    },
    
    // 创建发帖模态框
    createPostModal() {
        let modal = document.getElementById('postModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'postModal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
        return modal;
    },
    
    // 处理发帖表单提交
    handleCreatePost() {
        const content = document.getElementById('postContent')?.value;
        const tagsInput = document.getElementById('postTags')?.value;
        
        if (!content || content.trim().length < 10) {
            alert('帖子内容至少10个字符');
            return;
        }
        
        const post = this.createPost(content, tagsInput);
        
        if (post) {
            const modal = document.getElementById('postModal');
            if (modal) modal.style.display = 'none';
            
            const contentInput = document.getElementById('postContent');
            const tagsInputElement = document.getElementById('postTags');
            if (contentInput) contentInput.value = '';
            if (tagsInputElement) tagsInputElement.value = '';
        }
    },
    
    // 点赞/取消点赞
    toggleLike(postId) {
        const user = this.getCurrentUser();
        if (!user) {
            alert('请先登录才能点赞');
            return false;
        }
        
        const posts = this.getPosts();
        const post = posts.find(p => p.id === postId);
        
        if (!post) return false;
        
        const index = post.likes.indexOf(user.id);
        if (index === -1) {
            post.likes.push(user.id);
        } else {
            post.likes.splice(index, 1);
        }
        
        this.savePosts(posts);
        this.loadPageSpecificContent();
        return true;
    },
    
    // 显示/隐藏评论
    showComments(postId) {
        const section = document.getElementById(`comments-${postId}`);
        if (!section) return;
        
        if (section.style.display === 'none') {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    },
    
    // 用户注册 - 修复版本
    register(userData) {
        console.log('注册用户:', userData.username);
        
        const users = this.getUsers();
        
        if (users.some(u => u.username === userData.username)) {
            throw new Error('用户名已存在');
        }
        
        if (users.some(u => u.email === userData.email)) {
            throw new Error('邮箱已注册');
        }
        
        const newUser = {
            id: Date.now(),
            username: userData.username,
            email: userData.email,
            password: this.hashPassword(userData.password),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=${this.getRandomColor()}&color=fff`,
            bio: userData.bio || '还没有个人简介',
            joinDate: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            role: 'user',
            posts: [],
            followers: [],
            following: []
        };
        
        console.log('创建新用户:', newUser);
        users.push(newUser);
        this.saveUsers(users);
        
        // 自动登录
        this.createSession(newUser);
        
        return newUser;
    },
    
    // 用户登录 - 修复版本
    login(username, password) {
        console.log('尝试登录:', username);
        
        const users = this.getUsers();
        const hashedPassword = this.hashPassword(password);
        
        console.log('用户列表:', users.map(u => ({username: u.username, password: u.password.substring(0, 10)})));
        console.log('输入密码哈希:', hashedPassword.substring(0, 10));
        
        const user = users.find(u => {
            const usernameMatch = u.username === username || u.email === username;
            const passwordMatch = u.password === hashedPassword;
            console.log(`检查用户 ${u.username}: usernameMatch=${usernameMatch}, passwordMatch=${passwordMatch}`);
            return usernameMatch && passwordMatch;
        });
        
        if (!user) {
            throw new Error('用户名或密码错误');
        }
        
        console.log('找到用户:', user.username);
        
        user.lastActive = new Date().toISOString();
        this.saveUsers(users);
        
        this.createSession(user);
        
        return user;
    },
    
    // 创建会话
    createSession(user) {
        const session = {
            userId: user.id,
            loginTime: new Date().toISOString(),
            token: this.generateToken(),
            username: user.username
        };
        
        console.log('创建会话:', session);
        localStorage.setItem('community_session', JSON.stringify(session));
    },
    
    // 用户登出
    logout() {
        console.log('用户登出');
        localStorage.removeItem('community_session');
        
        this.renderUserPanel();
        this.loadPageSpecificContent();
        
        alert('已退出登录');
    },
    
    // 获取当前用户 - 修复版本
    getCurrentUser() {
        try {
            const sessionData = localStorage.getItem('community_session');
            console.log('会话数据:', sessionData);
            
            if (!sessionData) {
                return null;
            }
            
            const session = JSON.parse(sessionData);
            console.log('解析会话:', session);
            
            if (!session || !session.userId) {
                return null;
            }
            
            const users = this.getUsers();
            const user = users.find(u => u.id === session.userId);
            console.log('查找用户结果:', user ? '找到' : '未找到');
            
            if (!user) {
                localStorage.removeItem('community_session');
                return null;
            }
            
            return user;
        } catch (error) {
            console.error('获取当前用户失败:', error);
            return null;
        }
    },
    
    // 检查登录状态
    checkLoginStatus() {
        const user = this.getCurrentUser();
        if (user) {
            console.log('用户已登录:', user.username);
            user.lastActive = new Date().toISOString();
            this.saveUsers(this.getUsers());
        } else {
            console.log('用户未登录');
        }
        return !!user;
    },
    
    // 数据存储辅助方法
    getUsers() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.USERS);
            if (!data) return [];
            
            const users = JSON.parse(data);
            return users;
        } catch (error) {
            console.error('读取用户数据失败:', error);
            return [];
        }
    },
    
    saveUsers(users) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
        } catch (error) {
            console.error('保存用户数据失败:', error);
        }
    },
    
    getPosts() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.POSTS);
            if (!data) return [];
            
            const posts = JSON.parse(data);
            return posts;
        } catch (error) {
            console.error('读取帖子数据失败:', error);
            return [];
        }
    },
    
    savePosts(posts) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.POSTS, JSON.stringify(posts));
        } catch (error) {
            console.error('保存帖子数据失败:', error);
        }
    },
    
    getComments() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.COMMENTS);
            if (!data) return [];
            
            const comments = JSON.parse(data);
            return comments;
        } catch (error) {
            console.error('读取评论数据失败:', error);
            return [];
        }
    },
    
    saveComments(comments) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
        } catch (error) {
            console.error('保存评论数据失败:', error);
        }
    },
    
    // 密码哈希 - 修复版本（使用固定盐值）
    hashPassword(password) {
        // 使用固定的盐值，确保登录时能匹配
        return btoa('SALT_' + password);
    },
    
    // 清理数据
    clearData() {
        if (confirm('确定要清除所有数据吗？这将删除所有用户和帖子。')) {
            localStorage.removeItem(this.STORAGE_KEYS.USERS);
            localStorage.removeItem(this.STORAGE_KEYS.POSTS);
            localStorage.removeItem(this.STORAGE_KEYS.COMMENTS);
            localStorage.removeItem('community_session');
            
            alert('数据已清除，页面将刷新');
            window.location.reload();
        }
    },
    
    // 工具方法
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
        
        return date.toLocaleDateString('zh-CN');
    },
    
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },
    
    formatPostContent(content) {
        if (!content) return '';
        return content
            .replace(/\n/g, '<br>')
            .replace(/https?:\/\/[^\s]+/g, url => `<a href="${url}" target="_blank">${url}</a>`);
    },
    
    generateToken() {
        return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
    },
    
    getRandomColor() {
        const colors = ['4CAF50', '2196F3', 'FF9800', '9C27B0', 'F44336', '00BCD4'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，初始化社区系统...');
    
    if (typeof CommunitySystem !== 'undefined') {
        CommunitySystem.init();
    } else {
        console.error('CommunitySystem未定义！');
    }
});

// 全局可用
window.CommunitySystem = CommunitySystem;
