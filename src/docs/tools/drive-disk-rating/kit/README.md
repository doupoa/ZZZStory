# Zenless Zone Zero 驱动盘数据爬取工具

## 功能介绍

本工具用于获取《绝区零》(Zenless Zone Zero)游戏中登录账号的角色驱动盘数据。采用API调用方式获取数据，相比传统的页面元素提取方式更加可靠和高效。

### 核心功能

- 自动获取当前登录账号UID
- 读取所有已解锁角色信息
- 批量获取装备（驱动盘）与音擎（武器）信息
- 输出结构化的完整练度数据
- 支持数据导出为JSON格式

## 安装说明

### 方式1:

#### 1. 安装Python依赖

```bash
pip install -r requirements.txt
```

#### 2. 下载EdgeDriver

- 确保已安装Edge浏览器
- 从[EdgeDriver官网](https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/)下载与Edge浏览器版本匹配的EdgeDriver
- 解压后得到可执行文件

### 方式2:

下载并打开drive_disc_oneclick.html，按照上面的指引完成操作。无需安装Python依赖。

## 使用方法(只针对方式1)

### 基本使用

```bash
python zzz_driver_disc_scraper.py
```

### 指定EdgeDriver路径

如果系统无法自动找到EdgeDriver，可以手动指定路径：

```bash
python zzz_driver_disc_scraper.py --edgedriver "C:\path\to\msedgedriver.exe"
```

### 详细步骤

1. 运行脚本后，会自动打开Edge浏览器并访问目标网站
2. 在浏览器中完成登录操作
3. 登录完成后，在命令行窗口按Enter键继续
4. 脚本会自动爬取所有角色的驱动盘数据
5. 数据会保存为`driver_disc_data.json`文件

## 注意事项

1. 本工具仅用于学习和研究目的
2. 使用时请遵守相关网站的使用条款
3. 登录操作需要手动完成
4. 数据爬取可能需要较长时间，请耐心等待
5. 如果API接口发生变化，可能需要更新代码中的API调用部分

## 文件说明

- `zzz_driver_disc_scraper.py`: 主程序文件
- `requirements.txt`: 依赖包列表
- `drive_disc_oneclick.html`: 一键提取数据的HTML页面
- `driver_disc_data.json`: 爬取的数据文件（运行后生成）

## 常见问题

### Q: EdgeDriver找不到怎么办？
A: 请确保Edge浏览器已安装，并从官网下载对应版本的EdgeDriver，然后使用`--edgedriver`参数指定路径。

### Q: 登录后无法爬取数据？
A: 请确保登录完成后再按Enter键，或者检查网络连接是否正常。

### Q: 爬取的数据为空？
A: 可能是API接口发生变化，需要更新代码中的API调用部分，或者登录状态已失效，请重新登录。