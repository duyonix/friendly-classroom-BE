const mongoose = require('mongoose');
const Classroom = require('../models/Classroom');

const verifyAccessClassroom = async (req, res, next) => {
    try {
        const classroom = await Classroom.findById(req.params.classroomId)
            .select('teacherId listStudent')
            .lean();
        if (!classroom)
            return res.status(401).json({
                success: false,
                message: 'Classroom not found',
            });
        if (
            classroom.listStudent.includes(req.userId) ||
            classroom.teacherId == req.userId
        )
            next();
        else {
            return res.status(403).json({
                success: false,
                message: 'can not access this classroom',
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

module.exports = verifyAccessClassroom;
