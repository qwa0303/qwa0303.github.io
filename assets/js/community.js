// 社区系统 - 完全独立的多用户功能
const CommunitySystem = {
    // 数据存储键名（使用独立键，不影响原系统）
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
        this.loadPosts();
        this.loadOnlineUsers();
        
        // 渲染用户面板
        this.renderUserPanel();
    },
    
    // 初始化示例数据
    initializeSampleData() {
        const sampleUsers = [
            {
                id: 1,
                username: '技术大神',
                email: 'expert@example.com',
                password: '123456', // 实际中要哈希加密
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
                comments: [1, 2]
            },
            {
                id: 2,
                userId: 1,
                content: '推荐几个学习前端的好网站：\n1. MDN Web Docs\n2. freeCodeCamp\n3. JavaScript.info',
                tags: ['前端', '学习资源'],
                timestamp: new Date(Date.now() - 86400000).toISOString(), // 1天前
                likes: [2],
                comments: []
            },
            {
                id: 3,
                userId: 2,
                content: 'Python的pandas库真的好用，数据处理效率大大提升！大家有什么数据分析的经验分享吗？',
                tags: ['Python', '数据分析', 'Pandas'],
                timestamp: new Date(Date.now() - 172800000).toISOString(), // 2天前
                likes: [1],
                comments: [3]
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
    
    // 用户注册
    register(userData) {
        const users = this.getUsers();
        
        // 检查用户名和邮箱是否已存在
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
        
        // 更新最后活跃时间
        user.lastActive = new Date().toISOString();
        this.saveUsers(users);
        
        // 保存登录状态
        const session = {
            userId: user.id,
            loginTime: new Date().toISOString(),
            token: this.generateToken()
        };
        
        localStorage.setItem('community_session', JSON.stringify(session));
        
        // 更新UI
        this.renderUserPanel();
        this.updateCommunityStats();
        this.loadOnlineUsers();
        
        return user;
    },
    
    // 用户登出
    logout() {
        localStorage.removeItem('community_session');
        this.renderUserPanel();
        this.loadOnlineUsers();
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
            // 更新用户最后活跃时间
            user.lastActive = new Date().toISOString();
            this.saveUsers(this.getUsers());
        }
        return !!user;
    },
    
    // 发布帖子
    publishPost(content, tags = []) {
        const user = this.getCurrentUser();
        if (!user) {
            alert('请先登录才能发布帖子');
            this.showAuthForm('login');
            return null;
        }
        
        if (!content.trim()) {
            alert('请填写帖子内容');
            return null;
        }
        
        const posts = this.getPosts();
        const newPost = {
            id: Date.now(),
            userId: user.id,
            content: content.trim(),
            tags: tags,
            timestamp: new Date().toISOString(),
            likes: [],
            comments: []
        };
        
        posts.unshift(newPost);
        this.savePosts(posts);
        
        // 更新用户的帖子列表
        user.posts.push(newPost.id);
        this.saveUsers(this.getUsers());
        
        // 重新加载帖子
        this.loadPosts();
        this.updateCommunityStats();
        
        return newPost;
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
        return true;
    },
    
    // 添加评论
    addComment(postId, content) {
        const user = this.getCurrentUser();
        if (!user) {
            alert('请先登录才能评论');
            return null;
        }
        
        if (!content.trim()) {
            alert('请填写评论内容');
            return null;
        }
        
        const comments = this.getComments();
        const newComment = {
            id: Date.now(),
            postId: postId,
            userId: user.id,
            content: content.trim(),
            timestamp: new Date().toISOString()
        };
        
        comments.push(newComment);
        this.saveComments(comments);
        
        // 更新帖子的评论列表
        const posts = this.getPosts();
        const post = posts.find(p => p.id === postId);
        if (post) {
            post.comments.push(newComment.id);
            this.savePosts(posts);
        }
        
        this.updateCommunityStats();
        return newComment;
    },
    
    // 获取帖子评论
    getPostComments(postId) {
        const comments = this.getComments();
        const postComments = comments.filter(c => c.postId === postId);
        
        // 按时间排序（最新的在前）
        return postComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    
    // 加载帖子
    loadPosts() {
        const posts = this.getPosts();
        const users = this.getUsers();
        const container = document.getElementById('postsContainer');
        
        if (!container) return;
        
        if (posts.length === 0) {
            container.innerHTML = `
                <div class="post-card">
                    <div class="empty-state">
                        <h3>还没有帖子</h3>
                        <p>快来第一个发帖吧！</p>
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
                    
                    <div class="comments-section" id="comments-${post.id}" style="display: none;">
                        <div class="comment-form">
                            <input type="text" 
                                   class="comment-input" 
                                   placeholder="写下你的评论..."
                                   id="comment-input-${post.id}">
                            <button class="button small" 
                                    onclick="CommunitySystem.submitComment(${post.id})">发送</button>
                        </div>
                        <div class="comment-list" id="comment-list-${post.id}"></div>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // 加载在线用户
    loadOnlineUsers() {
        const container = document.getElementById('onlineUsersList');
        if (!container) return;
        
        const users = this.getUsers();
        
        // 按最后活跃时间排序，取前5个
        const onlineUsers = users
            .sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive))
            .slice(0, 5);
        
        container.innerHTML = onlineUsers.map(user => `
            <div class="user-item-sm">
                <img src="${user.avatar}" alt="${user.username}" class="user-avatar-sm">
                <div class="user-info-sm">
                    <strong>${user.username}</strong>
                    <small>${user.posts.length} 篇帖子</small>
                </div>
            </div>
        `).join('');
    },
    
    // 更新社区统计
    updateCommunityStats() {
        const users = this.getUsers();
        const posts = this.getPosts();
        const comments = this.getComments();
        
        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('totalPosts').textContent = posts.length;
        document.getElementById('totalComments').textContent = comments.length;
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
                    <button onclick="CommunitySystem.logout()" class="button">退出登录</button>
                </div>
            `;
            
            // 显示发布框
            document.getElementById('newPostCard').style.display = 'block';
            document.getElementById('publishBtn').disabled = false;
        } else {
            // 未登录状态
            container.innerHTML = `
                <h3>加入社区</h3>
                <p>登录后可以发布帖子、评论互动</p>
                <div class="auth-buttons">
                    <button onclick="CommunitySystem.showAuthForm('login')" class="button">登录</button>
                    <button onclick="CommunitySystem.showAuthForm('register')" class="button primary">注册</button>
                </div>
            `;
            
            // 隐藏发布框
            document.getElementById('newPostCard').style.display = 'none';
        }
    },
    
    // 显示登录/注册表单
    showAuthForm(type = 'login') {
        const container = document.getElementById('userPanel');
        if (!container) return;
        
        if (type === 'login') {
            container.innerHTML = `
                <h3>用户登录</h3>
                <form onsubmit="return CommunitySystem.handleLogin(event)">
                    <input type="text" 
                           placeholder="用户名或邮箱" 
                           class="auth-input"
                           id="authUsername"
                           required>
                    <input type="password" 
                           placeholder="密码" 
                           class="auth-input"
                           id="authPassword"
                           required>
                    <button type="submit" class="button primary btn-block">登录</button>
                </form>
                <p style="margin-top: 10px; text-align: center;">
                    还没有账号？ 
                    <a href="#" onclick="CommunitySystem.showAuthForm('register')">立即注册</a>
                </p>
            `;
        } else {
            container.innerHTML = `
                <h3>用户注册</h3>
                <form onsubmit="return CommunitySystem.handleRegister(event)">
                    <input type="text" 
                           placeholder="用户名" 
                           class="auth-input"
                           id="regUsername"
                           minlength="3"
                           required>
                    <input type="email" 
                           placeholder="邮箱" 
                           class="auth-input"
                           id="regEmail"
                           required>
                    <input type="password" 
                           placeholder="密码" 
                           class="auth-input"
                           id="regPassword"
                           minlength="6"
                           required>
                    <textarea placeholder="个人简介（可选）" 
                              class="auth-input"
                              id="regBio"
                              rows="2"></textarea>
                    <button type="submit" class="button primary btn-block">注册</button>
                </form>
                <p style="margin-top: 10px; text-align: center;">
                    已有账号？ 
                    <a href="#" onclick="CommunitySystem.showAuthForm('login')">立即登录</a>
                </p>
            `;
        }
    },
    
    // 处理登录表单
    handleLogin(event) {
        event.preventDefault();
        
        const username = document.getElementById('authUsername').value;
        const password = document.getElementById('authPassword').value;
        
        try {
            CommunitySystem.login(username, password);
            alert('登录成功！');
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
            CommunitySystem.register(userData);
            alert('注册成功！');
        } catch (error) {
            alert(error.message);
        }
    },
    
    // 显示/隐藏评论
    showComments(postId) {
        const section = document.getElementById(`comments-${postId}`);
        const list = document.getElementById(`comment-list-${postId}`);
        
        if (section.style.display === 'none') {
            section.style.display = 'block';
            this.loadComments(postId, list);
        } else {
            section.style.display = 'none';
        }
    },
    
    // 加载评论
    loadComments(postId, container) {
        const comments = this.getPostComments(postId);
        const users = this.getUsers();
        
        container.innerHTML = comments.map(comment => {
            const author = users.find(u => u.id === comment.userId);
            return `
                <div class="comment-item">
                    <img src="${author?.avatar || 'https://ui-avatars.com/api/?name=User'}" 
                         alt="${author?.username || '用户'}" 
                         class="comment-avatar">
                    <div class="comment-content">
                        <div>
                            <span class="comment-author">${author?.username || '未知用户'}</span>
                            <span class="comment-time">${this.formatTime(comment.timestamp)}</span>
                        </div>
                        <div class="comment-text">${comment.content}</div>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // 提交评论
    submitComment(postId) {
        const input = document.getElementById(`comment-input-${postId}`);
        const content = input.value.trim();
        
        if (content) {
            this.addComment(postId, content);
            input.value = '';
            
            // 重新加载评论
            const list = document.getElementById(`comment-list-${postId}`);
            this.loadComments(postId, list);
            
            // 更新帖子评论数
            this.loadPosts();
        }
    },
    
    // 发布新帖子
    publishPost() {
        const content = document.getElementById('newPostContent').value.trim();
        
        if (content) {
            this.publishPost(content);
            document.getElementById('newPostContent').value = '';
            alert('帖子发布成功！');
        } else {
            alert('请填写帖子内容');
        }
    },
    
    // 清空帖子
    clearPost() {
        document.getElementById('newPostContent').value = '';
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
    
    formatPostContent(content) {
        // 简单的格式化：换行转<br>，URL转链接
        return content
            .replace(/\n/g, '<br>')
            .replace(/https?:\/\/[^\s]+/g, url => `<a href="${url}" target="_blank">${url}</a>`);
    },
    
    hashPassword(password) {
        // 注意：实际应用中要用更安全的哈希算法
        // 这里仅为演示，使用简单编码
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
