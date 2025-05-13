"""
智能家居语音助手后端包
"""

from flask import Flask
from flask_cors import CORS

def create_app(config=None):
    """
    应用工厂函数，创建并配置Flask应用
    
    Args:
        config: 配置对象或字典
        
    Returns:
        Flask: 配置好的Flask应用实例
    """
    app = Flask(__name__)
    
    # 启用CORS支持
    CORS(app)
    
    # 应用配置
    app.config.from_mapping(
        SECRET_KEY='dev',
        DEBUG=True,
    )
    
    if config:
        app.config.from_mapping(config)
    
    # 注册蓝图
    from .api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    @app.route('/health')
    def health():
        return {'status': 'ok'}
    
    return app 