const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const Classroom = require('../models/Classroom');
const crypto = require('crypto');

class ClassroomController {
  // @route GET api/posts
  // @desc Get posts
  // @access Private
  get = async (req, res) => {
    try {
      const classroom = await Classroom.find({
        classroomId: req.params.classroomId,
      });
      res.json({ success: true, classroom });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  };

  // @route POST api/posts
  // @desc Create post
  // @access Private
  create = async (req, res) => {
    const { name, description } = req.body;
    if (!name || !description)
      return res
        .status(400)
        .json({ success: false, message: 'Please add all the fields' });

    try {
      let code = crypto.randomBytes(10).toString('hex');
      //   TODO: check code unique
      const newClassroom = new Classroom({
        name,
        code,
        description,
        createdBy: req.userId,
        listTeacher: [req.userId],
      });

      await newClassroom.save();
      res.json({
        success: true,
        message: 'Create new classroom successfully',
        classroom: newClassroom,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  };
  // @route PUT api/posts
  // @desc Update post
  // @access Private
  update = async (req, res) => {
    const { name, description } = req.body;

    // Simple validation
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: 'Name is required' });

    try {
      const classroomUpdateCondition = {
        _id: req.params.classroomId,
        createdBy: req.userId,
      };

      updatedClassroom = await Classroom.findOneAndUpdate(
        classroomUpdateCondition,
        {
          name,
          description,
        }
      );

      // User not authorized to update classroom or classroom not found
      if (!updatedClassroom)
        return res.status(401).json({
          success: false,
          message: 'Classroom not found or user not authorized',
        });

      res.json({
        success: true,
        message: 'Update classroom successfully',
        classroom: updatedClassroom,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  };

  // @route DELETE api/posts
  // @desc Delete post
  // @access Private
  delete = async (req, res) => {
    try {
      const classroomDeleteCondition = {
        _id: req.params.classroomId,
        createdBy: req.userId,
      };
      // TODO: delete all comment have postId
      const deleteClassroom = await Classroom.findOneAndDelete(
        classroomDeleteCondition
      );

      if (!deleteClassroom)
        return res.status(401).json({
          success: false,
          message: 'Classroom not found or user not authorized',
        });

      res.json({ success: true, classroom: deleteClassroom });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  };
}

module.exports = new ClassroomController();
