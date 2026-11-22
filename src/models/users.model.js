import { model, Schema } from "mongoose";
import {
  usersGenderEnumObj,
  usersRolesEnumObj,
} from "../common/enum/user.enum.js";
import { boolean } from "zod";

const usersSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return value.length < 3 ? false : true;
        },
        message: function (props) {
          return `${props.value} is not valid`;
        },
      },
    },
    lastName: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return value.length < 3 ? false : true;
        },
        message: function (props) {
          return `${props.value} is not valid`;
        },
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    confirmEmail: {
      type: boolean,
      default: false,
    },
    two_step_verification: {
      type: boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
      unique: true,
    },
    phone: String,
    DOB: Date,
    changeCredentialTime: Date,
    role: {
      type: Number,
      enum: Object.values(usersRolesEnumObj),
      default: usersRolesEnumObj.USER,
    },
    gender: {
      type: Number,
      enum: Object.values(usersGenderEnumObj),
    },
    profilePicPath : String ,
  },
  { timestamps: true, optimisticConcurrency: true, toJson: { virtuals: true } },
);

usersSchema
  .virtual("username")
  .set(function (value) {
    const [firstName, lastName] = value.split(" ");
    this.set({ firstName, lastName });
  })
  .get(function () {
    retrun`${this.get("firstName")} ${this.get("lastName")}`;
  });

const usersModel = model("users", usersSchema);

export default usersModel;
