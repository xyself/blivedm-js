import { BLiveClient } from '../src/clients/web_client.js';
import { BaseHandler } from '../src/handlers/base_handler.js';

// 测试房间ID列表
const TEST_ROOM_IDS = [
    411318
];

// 已登录账号的cookie中的SESSDATA字段值（可选）
const SESSDATA = '';

class MyHandler extends BaseHandler {
    on_client_start(client) {
        console.log(`[${client.roomId}] 客户端已启动`);
    }

    on_client_stop(client) {
        console.log(`[${client.roomId}] 客户端已停止`);
    }

    _on_heartbeat(client, message) {
        // 心跳包不输出
    }

    _on_danmaku(client, message) {
        console.log(`[${client.roomId}] ${message.uname}${message.medal.level > 0 ? `[${message.medal.name}${message.medal.level}]` : ''}: ${message.msg}`);
    }

    _on_gift(client, message) {
        console.log(`[${client.roomId}] ${message.uname} 赠送 ${message.giftName}x${message.num} (${message.coinType === 'gold' ? '金瓜子' : '银瓜子'}x${message.totalCoin})`);
    }

    _on_buy_guard(client, message) {
        const guardLevelName = ['', '总督', '提督', '舰长'][message.guardLevel];
        console.log(`[${client.roomId}] ${message.username} 开通了 ${guardLevelName}`);
    }

    _on_super_chat(client, message) {
        console.log(`[${client.roomId}] 醒目留言 ￥${message.price} ${message.uname}: ${message.message}`);
    }

    _on_super_chat_delete(client, message) {
        console.log(`[${client.roomId}] 删除醒目留言`);
    }

    _on_like(client, message) {
        console.log(`[${client.roomId}] 收到点赞`);
    }

    _on_interact_word(client, message) {
        if (message.msgType === 1) {
            console.log(`[${client.roomId}] ${message.uname}${message.fans_medal.medal_level > 0 ? `[${message.fans_medal.medal_name}${message.fans_medal.medal_level}]` : ''} 进入直播间`);
        }
    }
}

async function testSingleClient() {
    console.log('=== 测试单个直播间 ===');
    const roomId = TEST_ROOM_IDS[0];  // 使用TEST_ROOM_IDS中的第一个房间
    console.log(`正在连接房间: ${roomId}`);
    const client = new BLiveClient(roomId, { sessData: SESSDATA });  // 添加SESSDATA参数
    const handler = new MyHandler();
    client.set_handler(handler);
    await client.start();
    console.log('客户端启动成功，等待接收消息...');

    // 等待60秒后停止
    await new Promise(resolve => setTimeout(resolve, 60000));

    console.log('测试结束，正在停止客户端...');
    await client.stop();
}

async function testMultiClients() {
    console.log('=== 测试多个直播间 ===');
    // 创建多个客户端
    const clients = TEST_ROOM_IDS.map(roomId => new BLiveClient(roomId, { sessData: SESSDATA }));
    const handler = new MyHandler();
    
    // 设置处理器并启动
    for (const client of clients) {
        client.set_handler(handler);
        await client.start();
    }

    try {
        // 等待30秒后停止
        await new Promise(resolve => setTimeout(resolve, 30000));
    } finally {
        // 停止所有客户端
        for (const client of clients) {
            await client.stop();
        }
    }
}

// 运行测试
async function main() {
    await testSingleClient();
    
    // 只有当配置了多个房间时才执行多房间测试
    if (TEST_ROOM_IDS.length > 1) {
        await testMultiClients();
    }
}

main().catch(console.error); 