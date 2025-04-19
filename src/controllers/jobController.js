const Job = require('../models/Job.js');
const { successResponse, errorResponse } = require('../utils/response.js');
const { generateText } = require('ai');
const { openai } = require('@ai-sdk/openai');
const { generateJobPost } = require('../utils/func.js');

// Create a new job
exports.createJob = async (req, res) => {
  try {

    const job = new Job({ ...req.body, userId: req.user.id });
    await job.save();
    return successResponse(res, 'Job created successfully', job);
  } catch (error) {
    return errorResponse(res, 'Failed to create job', error);
  }
};

exports.createJobPost = async (req, res) => {
    try {
        const { description } = req.body;

        if (!description) {
            return errorResponse(res, 'Job description is required');
        }

        // Generate AI job post
        const jobPost = await generateJobPost(description);

        // await job.save();
        return successResponse(res, 'Job post created successfully', jobPost);

    } catch (error) {
        console.error('Error in createJobPost:', error);
        return errorResponse(res, 'Failed to create job post', error);
    }
};


// Update a job
exports.updateJob = async (req, res) => {
  const { id } = req.params;
  try {
    const job = await Job.findByIdAndUpdate(id, req.body, { new: true });
    if (!job) {
      return errorResponse(res, 'Job not found');
    }
    return successResponse(res, 'Job updated successfully', job);
  } catch (error) {
    return errorResponse(res, 'Failed to update job', error);
  }
};

// Delete a job
exports.deleteJob = async (req, res) => {
  const { id } = req.params;
  try {
    const job = await Job.findByIdAndDelete(id);
    if (!job) {
      return errorResponse(res, 'Job not found');
    }
    return successResponse(res, 'Job deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to delete job', error);
  }
};


// Get a single job by ID
exports.getJobById = async (req, res) => {
  const { id } = req.params;
  try {
    const job = await Job.findById(id);
    if (!job) {
      return errorResponse(res, 'Job not found');
    }
    return successResponse(res, 'Job retrieved successfully', job);
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve job', error);
  }
};



exports.getAllJobs = async (req, res) => {

  try {


    const { page = 1, limit = 10, q, company, location, type, salary, benefits, skills, remote, userId } = req.query;
    const query = {};


    if (q) {
      query.title = { $regex: q, $options: 'i' };
    }


    if (company) {
      query.company = { $regex: company, $options: 'i' };
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (type) {
      query.type = { $regex: type, $options: 'i' };
    }
    if (salary) {
      query.salary = { $regex: salary, $options: 'i' };
    }
    // if (benefits) {
    //   query.benefits = { $in: benefits.split(',').filter(Boolean) };
    // }
    if (remote !== undefined) {
      query.remote = remote === 'true';
    }
    if (userId) {
      query.userId = userId;
    }
    // if (skills) {
    //   query.skills = { $in: skills.split(',').filter(Boolean) };
    // }
    console.log("hitted jobs", req.query)
    const jobs = await Job.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit).lean()
    const count = await Job.countDocuments(query);

    return successResponse(res, 'Jobs retrieved successfully', {
      jobs: jobs || [],
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve jobs', error);
  }
}
exports.getAllMyJobs = async (req, res) => {

  try {
    const { page = 1, limit = 10, q, company, location, type, salary, benefits, skills, remote } = req.query;
    const query = {};


    if (q) {
      query.title = { $regex: q, $options: 'i' };
    }


    if (company) {
      query.company = { $regex: company, $options: 'i' };
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (type) {
      query.type = { $regex: type, $options: 'i' };
    }
    if (salary) {
      query.salary = { $regex: salary, $options: 'i' };
    }
    if (benefits) {
      query.benefits = { $in: benefits.split(',') };
    }
    query.userId = req.user.id;
    if (skills) {
      query.skills = { $in: skills.split(',') };
    }

    if (remote !== undefined) {
      query.remote = remote === 'true';
    }
    const jobs = await Job.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit).lean()
    const count = await Job.countDocuments(query);

    return successResponse(res, 'My jobs retrieved successfully', {
      jobs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve my jobs', error);
  }

}
