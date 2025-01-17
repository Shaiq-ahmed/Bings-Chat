const { StatusCodes } = require('http-status-codes');
const User = require('../models/userModel');
const fs = require("fs");
const path = require("path");
const cloudinary  = require('../utils/cloudinary');

const getUserProfile = async (req, res) => {
    try {
        const user_id = req.user.id

        const user = await User.findById(user_id).select("name email createdAt bio avatar")
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" })
        }
        return res.status(StatusCodes.OK).json(user)

    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Something went wrong, Please try again later" });
    }
}

const UpdateUserProfile = async (req, res, next) => {
    try {

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
        }

        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user.id },
            { $set: { name: req.body.name, phone_no: req.body.phone_no, bio: req.body.bio } },
            { runValidators: true, projection: { name: 1, phone_no: 1, email: 1, avatar: 1, createdAt: 1 } } 
        );

        if (!updatedUser) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "Update failed" });
        }

        return res.status(StatusCodes.OK).json({ msg: "Profile has been updated", user: updatedUser });


    } catch (error) {
        console.log(error);
        next(error)
        // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Something went wrong, Please try again later" });
    }
}

const updatePassword = async (req, res) => {
    try {
        const { old_password, new_password, confirm_password } = req.body
        if (!old_password || !new_password || !confirm_password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Provide all required fields " })
        }

        const user = await User.findOne({ _id: req.user.id }).select('+password')

        const isPasswordMatched = await user.comparePassword(old_password)
        if (!isPasswordMatched) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Invalid Password" })
        }
        if (new_password !== confirm_password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "new and confirm password do not match" })
        }

        user.password = new_password
        await user.save()
        res.status(StatusCodes.OK).json({ msg: "Password has been updated successfully!" })
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Something went wrong, Please try again later" });
    }

}

const searchUsers = async (req, res) => {
    try {
        const { search } = req.query;
        console.log(search);
        const searchCriteria = {
            $and: [
                { _id: { $ne: req.user.id } },
                {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                    ]
                }
            ]
        };

        const users = await User.find(searchCriteria).select('name email avatar')

        return res.status(StatusCodes.OK).json({ users });

    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Something went wrong, Please try again later" });
    }

}

//file system image upload

// const updateProfileAvatar = async (req, res, next) => {
//     try {
//         console.log(req.file);
//         const existsUser = await User.findById(req.user.id);
//         if (!existsUser) {
//             return res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
//         }

//         // Check if the user already has an avatar
//         if (existsUser.avatar) {
//             const existAvatarPath = path.join(__dirname, '..', 'uploads', existsUser.avatar); 

//             // Check if file exists before trying to delete it
//             if (fs.existsSync(existAvatarPath)) {
//                 fs.unlinkSync(existAvatarPath); // Delete Previous Image
//             } else {
//                 console.log(`File not found: ${existAvatarPath}`);
//             }
//         }

//         // Save new avatar file path to the user
//         const fileUrl = req.file.filename; // Use req.file.filename directly

//         const user = await User.findByIdAndUpdate(req.user.id, {
//             avatar: fileUrl,
//         }, { new: true });

//         res.status(200).json({
//             success: true,
//             user,
//         });

//     } catch (error) {
//         console.log(error);
//         next(error);
//     }
// };


const updateProfileAvatar = async (req, res, next) => {
    try {
        const existsUser = await User.findById(req.user.id);
        if (!existsUser) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
        }

        // Check if the user already has an avatar
        if (existsUser.avatar) {
            // Remove previous image from Cloudinary
            await cloudinary.uploader.destroy(existsUser.avatar);
        }

        // Upload new avatar to Cloudinary
        let profileImage = "";
        if (req.file) {
            try {
                const uploadResult = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "profile", resource_type: "image" },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    stream.end(req.file.buffer);
                });
                profileImage = uploadResult.secure_url; 
            } catch (err) {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: "Cloudinary upload failed" });
            }
        }

        // Save new avatar file path to the user
        const user = await User.findByIdAndUpdate(req.user.id, {
            avatar: profileImage,
        }, { new: true });

        res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {
        console.log(error);
        next(error);
    }
};
  
  
module.exports = {
    getUserProfile,
    updatePassword,
    UpdateUserProfile,
    searchUsers,
    updateProfileAvatar
}