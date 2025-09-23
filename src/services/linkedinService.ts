import { LoginResponse } from "../interfaces/DTO/IServices/IUserServise";
import { IJwtService } from "../interfaces/IJwt/Ijwt";
import { IUserRepository } from "../interfaces/Irepositories/IuserRepository";
import { IAuthService } from "../interfaces/Iserveices/IauthService";
import { inject, injectable } from "tsyringe";

@injectable()
export class LinkedInService implements IAuthService {
  constructor(
    @inject("IUserRepository") private _userRepository: IUserRepository,
    @inject("IJwtService") private _jwtService: IJwtService
  ) {}

  private async getLinkedInAccessToken(code: string) {
    try {
      if (
        !process.env.LINKEDIN_CLIENT_ID ||
        !process.env.LINKEDIN_CLIENT_SECRET ||
        !process.env.LINKEDIN_REDIRECT_URI
      ) {
        throw new Error("Missing LinkedIn environment variables");
      }

      const params = new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        scope: "openid profile email r_liteprofile r_emailaddress",
      });

      console.log("Request params:", params.toString());
      const linkedinTokenUrl = process.env.LINKEDIN_ACCESSTOKEN|| " ";

      const response = await fetch(
        linkedinTokenUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: params.toString(),
        }
      );

      console.log("Response status:", response.status);

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      if (!response.ok) {
        console.error("LinkedIn token error:", responseText);
        throw new Error(
          `LinkedIn token error: ${response.status} - ${responseText}`
        );
      }

      const data = JSON.parse(responseText);
      console.log("Parsed token response:", data);
      return data;
    } catch (error) {
      console.error("Error getting LinkedIn access token:", error);
      throw error;
    }
  }

  private async getLinkedInUserDataFromAPI(accessToken: string) {
    try {
      console.log("Getting LinkedIn user data from API...");
      const linkedinUserInfo = process.env.LINKEDIN_USERINFO|| " ";

      const userInfoResponse = await fetch(
        linkedinUserInfo,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!userInfoResponse.ok) {
        const errorText = await userInfoResponse.text();
        console.error(
          "LinkedIn userinfo error:",
          userInfoResponse.status,
          errorText
        );
        throw new Error(
          `Failed to get user info from LinkedIn API: ${userInfoResponse.status}`
        );
      }

      const userData = await userInfoResponse.json();
      console.log("User info data:", userData);

      return {
        id: userData.sub,
        email: userData.email,
        name: userData.name,
        given_name: userData.given_name,
        family_name: userData.family_name,
        picture: userData.picture,
        vanityName: userData.vanityName || userData.sub,
        email_verified: userData.email_verified,
      };
    } catch (error) {
      console.error("Error getting LinkedIn user data:", error);
      throw error;
    }
  }

  async authLogin(code: string): Promise<LoginResponse> {
    try {
      console.log("LinkedIn login service reached");

      const tokenResponse = await this.getLinkedInAccessToken(code);
      if (!tokenResponse.access_token) {
        return {
          success: false,
          message: "Failed to get LinkedIn access token",
        };
      }

      const userData = await this.getLinkedInUserDataFromAPI(
        tokenResponse.access_token
      );

      if (!userData.email) {
        return {
          success: false,
          message: "Failed to get user email from LinkedIn",
        };
      }

      let user = await this._userRepository.findByEmail(userData.email);
      console.log("Existing user:", user);

      const linkedinUrl = userData.vanityName
        ? `https://www.linkedin.com/in/${userData.vanityName}`
        : "";

      if (user) {
        await this._userRepository.updateUserProfile(String(user._id), {
          linkedin: linkedinUrl,
        });
      } else {
        const newUser = {
          username:
            userData.name || `${userData.given_name} ${userData.family_name}`,
          email: userData.email,
          password: "linkedin_oauth",
          status: "Active",
          linkedin: linkedinUrl,
        };
        user = await this._userRepository.createUser(newUser);
      }

      if (user.status === "InActive") {
        return {
          message: "User Blocked By Admin",
          success: false,
        };
      }

      const userId = String(user._id);
      const access_token = this._jwtService.generateAccessToken(userId, "USER");
      const refresh_token = this._jwtService.generateRefreshToken(
        userId,
        "USER"
      );

      return {
        success: true,
        message: "LinkedIn Login Successful",
        data: {
          username: user.username,
          email: user.email,
        },
        access_token,
        refresh_token,
      };
    } catch (error) {
      console.error("LinkedIn login error:", error);
      return {
        success: false,
        message: "Error occurred during LinkedIn login",
      };
    }
  }
}
