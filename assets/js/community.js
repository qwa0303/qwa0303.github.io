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
        // 初始化默认数据（如果不存在）
        if (!localStorage.getItem(this.STORAGE_KEYS.USERS)) {
            this.initializeSampleData();
        }
        
        // 检查登录状态
        this.checkLoginStatus();
        
        // 更新社区数据
        this.updateCommunityStats();
        
        // 根据当前页面加载不同内容
        this.loadPageSpecificContent();
        
        // 渲染用户面板
        this.renderUserPanel();
    },
    
    // 初始化示例数据
    initializeSampleData() {
        // 保持原来的示例数据不变...
        const sampleUsers = [
            {
                id: 1,
                username: '技术大神',
                email: 'expert@example.com',
                password: '123456',
                avatar: 'https://ui-avatars.com/api/?name=技术大神&background=4CAF50&color=fff',
                bio: '热爱分享技术的前端工程师',
                joinDate: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                role: 'user',
                posts: [1, 2],
                followers: [2, 3],
                following: [2]
            },
            {
                id: 2,
                username: 'Python爱好者',
                email: 'python@example.com',
                password: '123456',
                avatar: 'https://ui-avatars.com/api/?name=Python爱好者&background=2196F3&color=fff',
                bio: 'Python数据分析入门中',
                joinDate: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                role: 'user',
                posts: [3],
                followers: [1],
                following: [1]
            },
            {
                id: 3,
                username: '算法新手',
                email: 'algorithm@example.com',
                password: '123456',
                avatar: 'https://ui-avatars.com/api/?name=算法新手&background=FF9800&color=fff',
                bio: '刷题学习中',
                joinDate: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                role: 'user',
                posts: [],
                followers: [],
                following: [1]
            }
        ];
        
        const samplePosts = [
            {
                id: 1,
                userId: 1,
                content: '今天学习了Vue 3的Composition API，感觉比Options API更灵活！\n\n有没有一起学习的小伙伴？',
                tags: ['前端', 'Vue', 'JavaScript'],
                timestamp: new Date().toISOString(),
                likes: [2, 3],
                comments: [1, 2],
                views: 156,
                type: 'discussion'
            },
            {
                id: 2,
                userId: 1,
                content: '推荐几个学习前端的好网站：\n1. MDN Web Docs\n2. freeCodeCamp\n3. JavaScript.info',
                tags: ['前端', '学习资源'],
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                likes: [2],
                comments: [],
                views: 89,
                type: 'article'
            },
            {
                id: 3,
                userId: 2,
                content: 'Python的pandas库真的好用，数据处理效率大大提升！大家有什么数据分析的经验分享吗？',
                tags: ['Python', '数据分析', 'Pandas'],
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                likes: [1],
                comments: [3],
                views: 120,
                type: 'discussion'
            }
        ];
        
        const sampleComments = [
            {
                id: 1,
                postId: 1,
                userId: 2,
                content: '我也在学Vue 3，可以交流一下！',
                timestamp: new Date().toISOString()
            },
            {
                id: 2,
                postId: 1,
                userId: 3,
                content: 'Composition API确实更优雅',
                timestamp: new Date().toISOString()
            },
            {
                id: 3,
                postId: 3,
                userId: 1,
                content: '可以试试NumPy和Matplotlib，配合使用效果更好',
                timestamp: new Date().toISOString()
            }
        ];
        
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(sampleUsers));
        localStorage.setItem(this.STORAGE_KEYS.POSTS, JSON.stringify(samplePosts));
        localStorage.setItem(this.STORAGE_KEYS.COMMENTS, JSON.stringify(sampleComments));
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
    },
    
    // 加载热门帖子
    loadHotPosts() {
        const posts = this.getPosts();
        const users = this.getUsers();
        const container = document.getElementById('hotPosts');
        
        if (!container) return;
        
        // 按热度排序（点赞数+评论数）
        const hotPosts = [...posts]
            .sort((a, b) => {
                const scoreA = a.likes.length + a.comments.length + (a.views || 0) / 10;
                const scoreB = b.likes.length + b.comments.length + (b.views || 0) / 10;
                return scoreB - scoreA;
            })
            .slice(0, 5); // 只显示前5个
        
        if (hotPosts.length === 0) {
            container.innerHTML = '<p class="empty-message">还没有热门帖子</p>';
            return;
        }
        
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
        
        // 按时间排序，取最新5个
        const newPosts = [...posts]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);
        
        if (newPosts.length === 0) {
            container.innerHTML = '<p class="empty-message">还没有文章</p>';
            return;
        }
        
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
        
        // 按最后活跃时间排序，取前5个
        const onlineUsers = users
            .sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive))
            .slice(0, 5);
        
        if (onlineUsers.length === 0) {
            container.innerHTML = '<p class="empty-message">暂无在线用户</p>';
            return;
        }
        
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
    
    // 更新社区统计数据
    updateCommunityStats() {
        const users = this.getUsers();
        const posts = this.getPosts();
        
        // 首页统计数据
        const totalMembers = users.length;
        const totalPosts = posts.length;
        
        // 计算今日活跃用户（24小时内活跃）
        const activeToday = users.filter(user => {
            const lastActive = new Date(user.lastActive);
            const now = new Date();
            const diffHours = (now - lastActive) / (1000 * 60 * 60);
            return diffHours < 24;
        }).length;
        
        // 更新DOM元素
        if (document.getElementById('totalMembers')) {
            document.getElementById('totalMembers').textContent = totalMembers;
        }
        
        if (document.getElementById('totalPosts')) {
            document.getElementById('totalPosts').textContent = totalPosts;
        }
        
        if (document.getElementById('activeToday')) {
            document.getElementById('activeToday').textContent = activeToday;
        }
        
        // 更新用户面板的数据
        this.updateUserPanelStats();
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
                    <button onclick="CommunitySystem.logout()" class="btn btn-outline">退出登录</button>
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
            document.getElementById('authModal').style.display = 'none';
            
            // 重新加载页面内容
            this.renderUserPanel();
            this.updateCommunityStats();
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
            document.getElementById('authModal').style.display = 'none';
            
            // 重新加载页面内容
            this.renderUserPanel();
            this.updateCommunityStats();
            this.loadPageSpecificContent();
        } catch (error) {
            alert(error.message);
        }
    },
    
    // 用户注册（保持原功能）
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
    
    // 用户登录（保持原功能）
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
    
    // 用户登出（保持原功能）
    logout() {
        localStorage.removeItem('community_session');
        
        // 重新加载页面内容
        this.renderUserPanel();
        this.updateCommunityStats();
        this.loadPageSpecificContent();
        
        alert('已退出登录');
    },
    
    // 获取当前用户（保持原功能）
    getCurrentUser() {
        const session = JSON.parse(localStorage.getItem('community_session') || 'null');
        if (!session) return null;
        
        const users = this.getUsers();
        return users.find(u => u.id === session.userId);
    },
    
    // 检查登录状态（保持原功能）
    checkLoginStatus() {
        const user = this.getCurrentUser();
        if (user) {
            user.lastActive = new Date().toISOString();
            this.saveUsers(this.getUsers());
        }
        return !!user;
    },
    
    // 数据存储辅助方法（保持原功能）
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
        return btoa(password);
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
    CommunitySystem.init();
});
