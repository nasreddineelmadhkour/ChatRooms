import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import DB from './models/db.js'; 

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
    maxHttpBufferSize: 1e7 // 10 Mo
});

const usersInRooms = {};

io.on('connection', (socket) => {
    
    // --- الانضمام للغرفة ---
    socket.on('join_room', async (data) => {
        const { username, room, avatar } = data;
        
        socket.join(room);
        socket.username = username;
        socket.room = room;
        socket.avatar = avatar;

        if (!usersInRooms[room]) usersInRooms[room] = [];
        
        // منع التكرار وتحديث القائمة
        usersInRooms[room] = usersInRooms[room].filter(u => u.username !== username);
        usersInRooms[room].push({ username, avatar });

        // إرسال قائمة المستخدمين للجميع في الغرفة
        io.in(room).emit('room_users', usersInRooms[room]);

        // تسجيل في قاعدة البيانات
        try {
            await DB.Logs.create({
                ip: socket.handshake.address,
                details: `Connexion de ${username}`,
                username: username,
                room: room,
                datelog: new Date(new Date().getTime() + 3600000), // GMT+1
                msg: "A rejoint la room",
            });
        } catch (e) { console.error("Erreur log join:", e); }

        io.in(room).emit('receive_message', {
            username: 'Système',
            message: `📢 ${username} a rejoint le chat`,
            type: 'system',
            time: new Date().toLocaleTimeString()
        });
    });

    // --- نظام الكتابة (Typing) ---
    socket.on('typing', (data) => {
        socket.to(data.room).emit('user_typing', {
            username: data.username,
            typing: data.typing
        });
    });

    // --- إرسال الرسائل والصور ---
    socket.on('send_message', async (data) => {
        io.to(data.room).emit('receive_message', data);
        
        try {
            await DB.Logs.create({
                ip: socket.handshake.address,
                details: data.image ? "[Image]" : data.message,
                username: data.username,
                room: data.room,
                datelog: new Date(new Date().getTime() + 3600000),
                msg: data.image ? "[Image Base64]" : data.message, 
            });
        } catch (err) { console.error("Erreur log message:", err); }
    });

    // --- نظام اللعبة (Morpion) ---
    
    // تحريك الرموز
    socket.on('game_move', (data) => {
        io.to(data.room).emit('update_game', data);
    });

    // إعادة تشغيل اللعبة
    socket.on('game_reset', (data) => {
        io.to(data.room).emit('game_resetted');
    });

    // تعديل حجم المصفوفة (الميزة الجديدة)
    socket.on('change_game_size', (data) => {
        io.to(data.room).emit('size_changed', data.size);
    });

    // --- قطع الاتصال ---
    socket.on('disconnect', async () => {
        if (socket.username && socket.room) {
            // حذف المستخدم من القائمة
            if (usersInRooms[socket.room]) {
                usersInRooms[socket.room] = usersInRooms[socket.room].filter(u => u.username !== socket.username);
                
                // إذا أصبحت الغرفة فارغة نحذفها من الذاكرة تماماً
                if (usersInRooms[socket.room].length === 0) {
                    delete usersInRooms[socket.room];
                } else {
                    io.in(socket.room).emit('room_users', usersInRooms[socket.room]);
                }
            }

            try {
                await DB.Logs.create({
                    ip: socket.handshake.address,
                    details: `Déconnexion de ${socket.username}`, // تم التعديل هنا
                    username: socket.username,
                    room: socket.room,
                    datelog: new Date(new Date().getTime() + 3600000),
                    msg: "A quitté la room",
                });
            } catch (e) { console.error("Erreur log disconnect:", e); }

            io.in(socket.room).emit('receive_message', {
                username: 'Système',
                message: `🚶 ${socket.username} a quitté le chat`,
                type: 'system',
                time: new Date().toLocaleTimeString()
            });

            socket.on('change_game_size', (data) => {
    io.to(data.room).emit('size_changed', data.size);
});
        }
    });
});

server.listen(3001, () => {
    console.log("🚀 SERVER RUNNING ON PORT 3001");
});