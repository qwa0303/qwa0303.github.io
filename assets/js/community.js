// 社区系统 - 适配新首页结构
const CommunitySystem = {
    // 数据存储键名
    STORAGE_KEYS: {
        USERS: 'community_users',
        POSTS: 'community_posts',
        COMMENTS: 'community_comments',
        SESSIONS: 'community_sessions'
    },
    
    // 初始化数据
    init() {
        // 🔥 临时添加：强制清空旧数据（只加这一次）
        localStorage.removeItem('community_users');
        localStorage.removeItem('community_posts');
        localStorage.removeItem('community_comments');
        localStorage.removeItem('community_session');
        console.log('已强制清空旧数据');
        
        // 初始化默认数据（如果不存在）
        if (!localStorage.getItem(this.STORAGE_KEYS.USERS)) {
            this.initializeSampleData();
        }
        
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
    },
    
    // 初始化示例数据
    initializeSampleData() {
        // 创建空数组
        const emptyUsers = [];
        const emptyPosts = [];
        const emptyComments = [];
        
        // 可选：添加你自己的账号
        // const myUser = {
        //     id: 1,
        //     username: 'GJY',
        //     email: 'your-email@example.com',
        //     password: this.hashPassword('your-password'),
        //     avatar: 'images/pic00.jpg',
        //     bio: '计算机专业学生，热爱编程与分享',
        //     joinDate: new Date().toISOString(),
        //     lastActive: new Date().toISOString(),
        //     role: 'admin',
        //     posts: [],
        //     followers: [],
        //     following: []
        // };
        // emptyUsers.push(myUser);
        
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(emptyUsers));
        localStorage.setItem(this.STORAGE_KEYS.POSTS, JSON.stringify(emptyPosts));
        localStorage.setItem(this.STORAGE_KEYS.COMMENTS, JSON.stringify(emptyComments));
        
        console.log('社区数据已初始化：空数据状态');
    },
           
    // 加载页面特定内容
    loadPageSpecificContent() {
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
        
        // 搜索页面
        if (document.getElementById('searchResults')) {
            // 如果有搜索关键词参数，显示搜索结果
            const urlParams = new URLSearchParams(window.location.search);
            const searchQuery = urlParams.get('q');
            if (searchQuery) {
                this.showSearchResults(searchQuery);
            }
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
                        // 跳转到搜索页面或显示结果
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
            createPostBtn.addEventListener('click', () => {
                this.showCreatePostModal();
            });
        }
    },
    
    // 处理搜索
    handleSearch(keyword) {
        // 如果有专门的搜索页面，跳转到该页面
        if (window.location.pathname.includes('search.html')) {
            this.showSearchResults(keyword);
        } else {
            // 在当前页面显示搜索结果
            this.showSearchResultsInline(keyword);
        }
    },
    
    // 在页面中显示搜索结果
    showSearchResultsInline(keyword) {
        const results = this.searchPosts(keyword);
        const users = this.getUsers();
        
        // 创建或获取结果容器
        let resultsContainer = document.getElementById('searchResultsContainer');
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.id = 'searchResultsContainer';
            resultsContainer.className = 'search-results-container';
            
            // 插入到主要内容区域之前
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
                <div class="search-summary">
                    <p>找到 ${results.length} 个相关帖子</p>
                </div>
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
    
    // 显示搜索结果（专用页面版）
    showSearchResults(keyword) {
        const results = this.searchPosts(keyword);
        const users = this.getUsers();
        const container = document.getElementById('searchResults');
        
        if (!container) return;
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3>没有找到相关帖子</h3>
                    <p>关键词："${keyword}"</p>
                    <p>试试：</p>
                    <ul>
                        <li>使用其他关键词</li>
                        <li>检查拼写是否正确</li>
                        <li>尝试更通用的词汇</li>
                    </ul>
                    <div class="search-actions">
                        <button onclick="window.history.back()" class="btn btn-outline">返回</button>
                        <button onclick="CommunitySystem.showCreatePostModal()" class="btn btn-primary">
                            发布相关帖子
                        </button>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="search-header">
                <h2>搜索结果</h2>
                <div class="search-info">
                    <p>关键词："<strong>${keyword}</strong>"，找到 ${results.length} 个结果</p>
                </div>
            </div>
            <div class="posts-container">
                ${results.map(post => {
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
                            
                            <div class="post-content">${this.highlightText(this.formatPostContent(post.content), keyword)}</div>
                            
                            ${post.tags.length > 0 ? `
                                <div class="post-tags">
                                    ${post.tags.map(tag => `
                                        <span class="tag ${tag.toLowerCase().includes(keyword.toLowerCase()) ? 'tag-highlight' : ''}">
                                            ${tag}
                                        </span>
                                    `).join('')}
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
                }).join('')}
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
            
            // 搜索内容
            if (post.content.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            // 搜索标签
            if (post.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
                return true;
            }
            
            // 搜索作者
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
    
    // 加载热门帖子 - 空数据友好版
    loadHotPosts() {
        const posts = this.getPosts();
        const users = this.getUsers();
        const container = document.getElementById('hotPosts');
        
        if (!container) return;
        
        if (posts.length === 0) {
            // 空状态：没有帖子
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
        
        // 按热度排序（点赞数+评论数）
        const hotPosts = [...posts]
            .sort((a, b) => {
                const scoreA = a.likes.length + a.comments.length + (a.views || 0) / 10;
                const scoreB = b.likes.length + b.comments.length + (b.views || 0) / 10;
                return scoreB - scoreA;
            })
            .slice(0, 5); // 只显示前5个
        
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
    
    // 加载最新文章 - 空数据友好版
    loadNewArticles() {
        const posts = this.getPosts();
        const users = this.getUsers();
        const container = document.getElementById('newArticles');
        
        if (!container) return;
        
        if (posts.length === 0) {
            // 空状态：没有文章
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
        
        // 按时间排序，取最新5个
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
    
    // 加载在线用户 - 空数据友好版
    loadOnlineUsers() {
        const container = document.getElementById('onlineUsers');
        if (!container) return;
        
        const users = this.getUsers();
        
        if (users.length === 0) {
            // 空状态：没有用户
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
        
        // 按最后活跃时间排序，取前5个
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
    
    // 加载帖子（用于其他页面）
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
        
        // 按时间排序（最新的在前）
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
    
    // ========== 新增功能：加载文章 ==========
    loadArticles() {
        const posts = this.getPosts();
        const users = this.getUsers();
        const container = document.getElementById('articlesContainer');
        
        if (!container) return;
        
        // 筛选文章类型（可以根据标签或内容判断）
        const articles = posts.filter(post => 
            post.tags.includes('文章') || 
            post.content.length > 200 // 较长的内容视为文章
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
        
        // 按时间排序（最新的在前）
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
    
    // ========== 新增功能：加载问答 ==========
    loadQuestions() {
        const posts = this.getPosts();
        const users = this.getUsers();
        const container = document.getElementById('questionsContainer');
        
        if (!container) return;
        
        // 筛选问答类型
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
        
        // 按时间排序（最新的在前）
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
    
    // ========== 新增功能：加载项目 ==========
    loadProjects() {
        const container = document.getElementById('projectsContainer');
        if (!container) return;
        
        // 示例项目数据
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
    
    // 更新用户面板统计数据
    updateUserPanelStats() {
        const user = this.getCurrentUser();
        if (user && document.querySelector('.user-stats')) {
            const statsContainer = document.querySelector('.user-stats');
            statsContainer.innerHTML = `
                <span>帖子: ${user.posts.length}</span>
                <span>粉丝: ${user.followers.length}</span>
            `;
        }
    },
    
    // 渲染用户面板
    renderUserPanel() {
        const container = document.getElementById('userPanel');
        if (!container) return;
        
        const user = this.getCurrentUser();
        
        if (user) {
            // 已登录状态
            container.innerHTML = `
                <div class="user-avatar-lg">
                    <img src="${user.avatar}" alt="${user.username}">
                </div>
                <h3>${user.username}</h3>
                <p class="user-bio">${user.bio || '还没有个人简介'}</p>
                <div class="user-stats">
                    <span>帖子: ${user.posts.length}</span>
                    <span>粉丝: ${user.followers.length}</span>
                </div>
                <div class="user-actions">
                    <button onclick="CommunitySystem.showCreatePostModal()" class="btn btn-primary">
                        <i class="fas fa-plus"></i> 发帖
                    </button>
                    <button onclick="CommunitySystem.logout()" class="btn btn-outline">退出</button>
                </div>
            `;
        } else {
            // 未登录状态
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
        const modal = document.getElementById('authModal');
        if (!modal) {
            // 如果没有模态框，直接弹出提示
            alert('请先注册/登录');
            return;
        }
        
        const modalContent = modal.querySelector('.modal-content') || modal;
        
        if (type === 'login') {
            modalContent.innerHTML = `
                <div class="auth-form">
                    <h2>用户登录</h2>
                    <form onsubmit="return CommunitySystem.handleLogin(event)">
                        <div class="form-group">
                            <input type="text" 
                                   placeholder="用户名或邮箱" 
                                   class="form-input"
                                   id="authUsername"
                                   required>
                        </div>
                        <div class="form-group">
                            <input type="password" 
                                   placeholder="密码" 
                                   class="form-input"
                                   id="authPassword"
                                   required>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">登录</button>
                    </form>
                    <p class="auth-switch">
                        还没有账号？ 
                        <a href="#" onclick="CommunitySystem.showAuthModal('register')">立即注册</a>
                    </p>
                </div>
            `;
        } else {
            modalContent.innerHTML = `
                <div class="auth-form">
                    <h2>用户注册</h2>
                    <form onsubmit="return CommunitySystem.handleRegister(event)">
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
                        <button type="submit" class="btn btn-primary btn-block">注册</button>
                    </form>
                    <p class="auth-switch">
                        已有账号？ 
                        <a href="#" onclick="CommunitySystem.showAuthModal('login')">立即登录</a>
                    </p>
                </div>
            `;
        }
        
        // 显示模态框
        modal.style.display = 'block';
        
        // 点击模态框外部关闭
        modal.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
        
        // ESC键关闭
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    },
    
    // 处理登录表单
    handleLogin(event) {
        event.preventDefault();
        
        const username = document.getElementById('authUsername').value;
        const password = document.getElementById('authPassword').value;
        
        try {
            this.login(username, password);
            alert('登录成功！');
            
            // 关闭模态框
            const modal = document.getElementById('authModal');
            if (modal) modal.style.display = 'none';
            
            // 重新加载页面内容
            this.renderUserPanel();
            this.loadPageSpecificContent();
        } catch (error) {
            alert(error.message);
        }
    },
    
    // 处理注册表单
    handleRegister(event) {
        event.preventDefault();
        
        const userData = {
            username: document.getElementById('regUsername').value,
            email: document.getElementById('regEmail').value,
            password: document.getElementById('regPassword').value,
            bio: document.getElementById('regBio').value
        };
        
        try {
            this.register(userData);
            alert('注册成功！');
            
            // 关闭模态框
            const modal = document.getElementById('authModal');
            if (modal) modal.style.display = 'none';
            
            // 重新加载页面内容
            this.renderUserPanel();
            this.loadPageSpecificContent();
        } catch (error) {
            alert(error.message);
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
        
        // 内容验证
        if (!content || content.trim().length === 0) {
            alert('帖子内容不能为空');
            return null;
        }
        
        if (content.trim().length < 10) {
            alert('帖子内容至少10个字符');
            return null;
        }
        
        // 标签处理：转为数组并过滤空值
        const processedTags = Array.isArray(tags) 
            ? tags 
            : typeof tags === 'string' 
                ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                : [];
        
        // 限制标签数量
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
        
        // 保存帖子
        posts.push(newPost);
        this.savePosts(posts);
        
        // 更新用户的帖子列表
        const updatedUsers = users.map(u => {
            if (u.id === user.id) {
                return {
                    ...u,
                    posts: [...u.posts, newPost.id],
                    lastActive: new Date().toISOString()
                };
            }
            return u;
        });
        
        this.saveUsers(updatedUsers);
        
        // 更新当前用户数据
        const updatedUser = updatedUsers.find(u => u.id === user.id);
        const session = JSON.parse(localStorage.getItem('community_session') || 'null');
        if (session && updatedUser) {
            localStorage.setItem('community_session', JSON.stringify({
                ...session,
                lastActive: new Date().toISOString()
            }));
        }
        
        console.log('新帖子创建成功:', newPost);
        
        // 重新加载页面内容
        this.loadPageSpecificContent();
        this.renderUserPanel();
        
        // 显示成功提示
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
                <form onsubmit="return CommunitySystem.handleCreatePost(event)">
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
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-paper-plane"></i> 发布
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        modal.style.display = 'block';
        
        // 点击模态框外部关闭
        modal.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
        
        // ESC键关闭
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    },
    
    // 创建发帖模态框（如果不存在）
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
    handleCreatePost(event) {
        event.preventDefault();
        
        const content = document.getElementById('postContent').value;
        const tagsInput = document.getElementById('postTags').value;
        
        const post = this.createPost(content, tagsInput);
        
        if (post) {
            // 关闭模态框
            const modal = document.getElementById('postModal');
            if (modal) modal.style.display = 'none';
            
            // 重置表单
            document.getElementById('postContent').value = '';
            document.getElementById('postTags').value = '';
        }
        
        return false;
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
        
        // 重新加载帖子显示
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
    
    // 用户注册
    register(userData) {
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
        
        users.push(newUser);
        this.saveUsers(users);
        
        // 自动登录
        this.login(userData.username, userData.password);
        
        return newUser;
    },
    
    // 用户登录
    login(username, password) {
        const users = this.getUsers();
        const user = users.find(u => 
            (u.username === username || u.email === username) && 
            u.password === this.hashPassword(password)
        );
        
        if (!user) {
            throw new Error('用户名或密码错误');
        }
        
        user.lastActive = new Date().toISOString();
        this.saveUsers(users);
        
        const session = {
            userId: user.id,
            loginTime: new Date().toISOString(),
            token: this.generateToken()
        };
        
        localStorage.setItem('community_session', JSON.stringify(session));
        return user;
    },
    
    // 用户登出
    logout() {
        localStorage.removeItem('community_session');
        
        // 重新加载页面内容
        this.renderUserPanel();
        this.loadPageSpecificContent();
        
        alert('已退出登录');
    },
    
    // 获取当前用户
    getCurrentUser() {
        const session = JSON.parse(localStorage.getItem('community_session') || 'null');
        if (!session) return null;
        
        const users = this.getUsers();
        return users.find(u => u.id === session.userId);
    },
    
    // 检查登录状态
    checkLoginStatus() {
        const user = this.getCurrentUser();
        if (user) {
            user.lastActive = new Date().toISOString();
            this.saveUsers(this.getUsers());
        }
        return !!user;
    },
    
    // 数据存储辅助方法
    getUsers() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS) || '[]');
    },
    
    saveUsers(users) {
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
    },
    
    getPosts() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.POSTS) || '[]');
    },
    
    savePosts(posts) {
        localStorage.setItem(this.STORAGE_KEYS.POSTS, JSON.stringify(posts));
    },
    
    getComments() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.COMMENTS) || '[]');
    },
    
    saveComments(comments) {
        localStorage.setItem(this.STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
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
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },
    
    formatPostContent(content) {
        return content
            .replace(/\n/g, '<br>')
            .replace(/https?:\/\/[^\s]+/g, url => `<a href="${url}" target="_blank">${url}</a>`);
    },
    
    hashPassword(password) {
        return btoa(password + 'SALT_KEY');
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
    if (typeof CommunitySystem !== 'undefined') {
        CommunitySystem.init();
    }
});

// 全局可用
window.CommunitySystem = CommunitySystem;
