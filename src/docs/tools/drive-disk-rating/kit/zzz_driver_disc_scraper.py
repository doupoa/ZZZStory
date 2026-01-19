from selenium import webdriver
from selenium.webdriver.edge.service import Service
from selenium.webdriver.edge.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import json
import os
import sys

class ZZZDriverDiscScraper:
    def __init__(self, edgedriver_path=None):
        # 配置Edge选项
        self.edge_options = Options()
        # 可以根据需要添加更多选项，如无头模式
        # self.edge_options.add_argument('--headless')
        self.edge_options.add_argument('--no-sandbox')
        self.edge_options.add_argument('--disable-dev-shm-usage')
        
        # 初始化WebDriver
        try:
            if edgedriver_path and os.path.exists(edgedriver_path):
                print(f"使用指定的EdgeDriver路径: {edgedriver_path}")
                service = Service(edgedriver_path)
            else:
                print("尝试使用系统中的EdgeDriver...")
                service = Service()  # 尝试自动查找
                
            self.driver = webdriver.Edge(
                service=service,
                options=self.edge_options
            )
            self.wait = WebDriverWait(self.driver, 10)
        except Exception as e:
            print(f"初始化WebDriver失败: {e}")
            print("请确保已安装Edge浏览器，并下载对应版本的EdgeDriver")
            print("可以从https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/下载")
            sys.exit(1)
    
    def visit_website(self):
        """访问目标网站"""
        url = "https://act.mihoyo.com/zzz/gt/character-builder-h/index.html#/"
        self.driver.get(url)
        print(f"已访问: {url}")
    
    def handle_login(self):
        """处理登录逻辑"""
        print("请在浏览器中完成登录操作...")
        # 等待用户登录完成
        input("登录完成后按Enter键继续...")
    
    def scrape_driver_disc_data(self):
        """使用API爬取驱动盘数据"""
        print("开始使用API爬取驱动盘数据...")
        import requests
        import json
        
        # API配置
        API_BASE = "https://act-api-takumi.mihoyo.com/event/nap_cultivate_tool"
        API_LOGIN = "https://api-takumi.mihoyo.com/common/badge/v1/login/info"
        
        # 从Selenium获取cookies
        cookies = self.driver.get_cookies()
        cookie_dict = {cookie['name']: cookie['value'] for cookie in cookies}
        
        # 清理文本中的 HTML 标签与转义换行
        def clean_text(text):
            if not text:
                return ""
            import re
            return re.sub(r'<[^>]*>', '', text).replace('\\n', '')
        
        # 包装requests为JSON解析
        def fetch_json(url, options={}):
            headers = options.get('headers', {})
            method = options.get('method', 'GET')
            data = options.get('data')
            
            response = requests.request(
                method, 
                url, 
                headers=headers, 
                data=data,
                cookies=cookie_dict
            )
            response.raise_for_status()
            return response.json()
        
        # 获取当前登录账号UID
        def get_game_uid():
            url = f"{API_LOGIN}?game_biz=nap_cn&lang=zh-cn"
            data = fetch_json(url)
            return data.get('data', {}).get('game_uid')
        
        # 从cookie获取设备指纹
        def get_device_fp():
            return cookie_dict.get('DEVICEFP')
        
        # 获取基础角色列表
        def get_basic_list(uid, fp):
            url = f"{API_BASE}/user/avatar_basic_list?uid={uid}&region=prod_gf_cn"
            headers = {"x-rpc-device_fp": fp}
            return fetch_json(url, {"headers": headers})
        
        # 分批请求角色详情每批最多10个
        def get_equip_batch(uid, batch, fp):
            url = f"{API_BASE}/user/batch_avatar_detail_v2?uid={uid}&region=prod_gf_cn"
            headers = {"x-rpc-device_fp": fp, "Content-Type": "application/json"}
            data = json.dumps({"avatar_list": batch})
            return fetch_json(url, {
                "method": "POST",
                "headers": headers,
                "data": data
            })
        
        # 数据清洗逻辑
        def process_equip_data(item):
            avatar = item.get('avatar', {})
            equip = item.get('equip', [])
            weapon = item.get('weapon')
            
            return {
                # 角色基础信息
                'role': {
                    'level': avatar.get('level'),
                    'name': avatar.get('name_mi18n'),
                    'full_name': avatar.get('full_name_mi18n'),
                    'camp_name': avatar.get('camp_name_mi18n'),
                    'profession': avatar.get('avatar_profession'),
                    'rarity': avatar.get('rarity'),
                    'group_icon': avatar.get('group_icon_path'),
                    'avatar_icon': avatar.get('hollow_icon_path'),
                    
                    # 属性
                    'properties': [
                        {
                            'name': prop.get('property_name'),
                            'val': prop.get('final')
                        } for prop in avatar.get('properties', [])
                    ],
                    
                    # 潜能
                    'ranks': [
                        {
                            'name': rank.get('name'),
                            'desc': clean_text(rank.get('desc')),
                            'unlocked': rank.get('is_unlocked')
                        } for rank in avatar.get('ranks', [])
                    ]
                },
                
                # 驱动盘信息
                'equips': [
                    {
                        'level': e.get('level'),
                        'name': e.get('name'),
                        'icon': e.get('icon'),
                        'rarity': e.get('rarity'),
                        'invalid_property': e.get('invalid_property_cnt'),
                        'num': e.get('equipment_type'),
                        
                        # 子属性
                        'properties': [
                            {
                                'name': prop.get('property_name'),
                                'val': prop.get('base'),
                                'level': prop.get('level'),
                                'valid': prop.get('valid'),
                                'add': prop.get('add')
                            } for prop in e.get('properties', [])
                        ],
                        
                        # 主属性
                        'main_properties': {
                            'name': e.get('main_properties', [{}])[0].get('property_name'),
                            'val': e.get('main_properties', [{}])[0].get('base'),
                            'level': e.get('main_properties', [{}])[0].get('level'),
                            'valid': e.get('main_properties', [{}])[0].get('valid'),
                            'add': e.get('main_properties', [{}])[0].get('add')
                        },
                        
                        # 套装信息
                        'suit': {
                            'name': e.get('equip_suit', {}).get('name'),
                            'desc1': e.get('equip_suit', {}).get('desc1'),
                            'desc2': clean_text(e.get('equip_suit', {}).get('desc2'))
                        }
                    } for e in equip
                ],
                
                # 音擎信息
                'weapon': weapon and {
                    'level': weapon.get('level'),
                    'name': weapon.get('name'),
                    'star': weapon.get('star'),
                    'icon': weapon.get('icon'),
                    'rarity': weapon.get('rarity'),
                    'talent_title': weapon.get('talent_title'),
                    'talent_content': clean_text(weapon.get('talent_content')),
                    'profession': weapon.get('profession'),
                    'property': weapon.get('properties', [{}])[0],
                    'main_properties': weapon.get('main_properties', [{}])[0]
                }
            }
        
        try:
            # 主流程开始
            uid = get_game_uid()
            device_fp = get_device_fp()
            
            if not uid or not device_fp:
                print("❌ 无法读取UID或DEVICEFP，可能未登录！")
                return {}
            
            print(f"🎮 当前登录UID: {uid}")
            
            # 获取基础角色列表
            basic_data = get_basic_list(uid, device_fp)
            
            # 检查basic_data是否有效
            if not basic_data:
                print("❌ 获取角色列表失败，basic_data为空")
                return {}
            
            # 检查返回数据结构
            data = basic_data.get('data', {})
            if not data:
                print(f"❌ API返回数据结构异常: {json.dumps(basic_data, ensure_ascii=False)}")
                return {}
            
            list_data = data.get('list', [])
            if not isinstance(list_data, list):
                print(f"❌ 角色列表不是预期的数组格式: {type(list_data)}")
                return {}
            
            avatar_list = [
                {'avatar_id': item.get('avatar', {}).get('id')}
                for item in list_data
                if item.get('unlocked')
            ]
            
            print(f"已找到 {len(avatar_list)} 位已解锁角色，开始获取装备详情...")
            
            # 将角色ID分批，每批最多10个
            batches = []
            for i in range(0, len(avatar_list), 10):
                batches.append(avatar_list[i:i+10])
            
            # 并发请求所有批次
            all_results = []
            for i, batch in enumerate(batches):
                print(f"处理批次 {i+1}/{len(batches)}...")
                batch_data = get_equip_batch(uid, batch, device_fp)
                
                # 清洗批次数据
                processed_batch = [
                    process_equip_data(item)
                    for item in batch_data.get('data', {}).get('list', [])
                ]
                all_results.extend(processed_batch)
            
            print(f"🎉 已成功提取所有角色数据（共{len(all_results)}个角色）")
            return all_results
            
        except Exception as e:
            print(f"API调用失败: {e}")
            import traceback
            traceback.print_exc()
            return {}
    
    def save_data(self, data, filename="driver_disc_data.json"):
        """保存爬取的数据"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"数据已保存到: {filename}")
    
    def close(self):
        """关闭浏览器"""
        self.driver.quit()
        print("浏览器已关闭")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Zenless Zone Zero 驱动盘数据爬取工具")
    parser.add_argument("--edgedriver", help="EdgeDriver的路径")
    args = parser.parse_args()
    
    scraper = ZZZDriverDiscScraper(edgedriver_path=args.edgedriver)
    try:
        scraper.visit_website()
        scraper.handle_login()
        data = scraper.scrape_driver_disc_data()
        scraper.save_data(data)
    finally:
        scraper.close()