const Goal = require('../models/Goal');
const { sendEmail } = require('../utils/mailer');

// Helper to notify of goal completion
const checkGoalCompletion = async (user, goalTitle, savedAmount, targetAmount) => {
  if (savedAmount >= targetAmount) {
    try {
      await sendEmail({
        to: user.email,
        subject: `🎉 Congratulations! Savings Goal Reached: ${goalTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #059669; text-align: center;">You Did It! 🏆</h2>
            <p>Dear ${user.name},</p>
            <p>Congratulations! You have successfully reached your target savings goal for <strong>${goalTitle}</strong>!</p>
            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 6px; text-align: center; margin: 20px 0;">
              <span style="font-size: 14px; color: #065f46; font-weight: bold;">GOAL COMPLETED</span>
              <div style="font-size: 24px; color: #047857; font-weight: bold; margin-top: 5px;">${goalTitle}</div>
              <div style="font-size: 16px; color: #065f46; margin-top: 5px;">Saved: $${savedAmount.toFixed(2)} of $${targetAmount.toFixed(2)}</div>
            </div>
            <p>Tracking and achieving goals is a critical step towards financial independence. Keep up the amazing work!</p>
            <p style="color: #64748b; font-size: 12px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        `
      });
      return true;
    } catch (mailErr) {
      console.error('Goal completion email failed to send:', mailErr.message);
    }
  }
  return false;
};

// @desc    Get all goals for user
// @route   GET /api/goal
// @access  Private
exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ deadline: 1 });
    res.status(200).json({ success: true, count: goals.length, data: goals });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new goal
// @route   POST /api/goal
// @access  Private
exports.addGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, savedAmount, deadline } = req.body;

    if (!title || !targetAmount || !deadline) {
      return res.status(400).json({ success: false, message: 'Please provide title, targetAmount and deadline' });
    }

    const goal = await Goal.create({
      userId: req.user.id,
      title,
      targetAmount,
      savedAmount: savedAmount || 0,
      deadline
    });

    const isCompleted = await checkGoalCompletion(req.user, title, goal.savedAmount, targetAmount);

    res.status(201).json({
      success: true,
      data: goal,
      goalCompleted: isCompleted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal
// @route   PUT /api/goal/:id
// @access  Private
exports.updateGoal = async (req, res, next) => {
  try {
    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    if (goal.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this goal record' });
    }

    const oldSaved = goal.savedAmount;
    goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Send email only if it transition from not completed to completed
    const wasCompletedBefore = oldSaved >= goal.targetAmount;
    let isCompleted = false;
    if (!wasCompletedBefore) {
      isCompleted = await checkGoalCompletion(req.user, goal.title, goal.savedAmount, goal.targetAmount);
    }

    res.status(200).json({
      success: true,
      data: goal,
      goalCompleted: isCompleted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete goal
// @route   DELETE /api/goal/:id
// @access  Private
exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    if (goal.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this goal record' });
    }

    await goal.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
