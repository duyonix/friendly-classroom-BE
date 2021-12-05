const Classroom = require('../controllers/Classroom');

const verifyAccessClassroom = (req, res, next) => {
    try {
        const classroom = await Classroom.findOne({
            _id: req.params.classroomId,
        }).select('listTeacher listStudent');

        if (
            classroom.listStudent.includes(req.userId) ||
            classroom.teacherId == req.userId
        )
            next();
    } catch (error) {
        console.log(error);
        return res
            .status(403)
            .json({ success: false, message: 'can not access this classroom' });
    }
};

module.exports = verifyAccessClassroom;
