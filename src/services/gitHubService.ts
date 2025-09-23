import { LoginResponse } from "../interfaces/DTO/IServices/IUserServise";
import { IAuthService } from "../interfaces/Iserveices/IauthService";
import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../interfaces/Irepositories/IuserRepository";
import { IJwtService } from "../interfaces/IJwt/Ijwt";

@injectable()
export class GitHubService implements IAuthService {
  constructor(
    @inject("IUserRepository") private _userRepository: IUserRepository,
    @inject("IJwtService") private _jwtService: IJwtService
  ) {}

  private async getGitHubAccessToken(code: string) {
    const githubTokenUrl = process.env.GITHUB_TOKEN_URL || " ";
    try {
      const response = await fetch(githubTokenUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code: code,
        }),
      });

      const data = await response.json();
      console.log("GitHub token response:", data);
      return data;
    } catch (error) {
      console.error("Error getting GitHub access token:", error);
      throw error;
    }
  }

  async getGitHubUserData(accessToken: string) {
    const githubUserUrl = process.env.GITHUB_USER_URL || " ";
    const githubEmailsUrl = process.env.GITHUB_USER_EMAILS_URL || " ";
    try {
      const response = await fetch(githubUserUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "YourAppName",
        },
      });

      if (!response.ok) {
        throw new Error(
          `GitHub API error: ${response.status} ${response.statusText}`
        );
      }

      const userData = await response.json();
      console.log("Basic GitHub user data:", userData);

      if (!userData.email) {
        try {
          const emailResponse = await fetch(githubEmailsUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "YourAppName",
            },
          });

          if (emailResponse.ok) {
            const emails = await emailResponse.json();
            console.log("GitHub emails response:", emails);

            if (Array.isArray(emails) && emails.length > 0) {
              const primaryEmail = emails.find((e) => e.primary && e.verified);
              if (primaryEmail) {
                userData.email = primaryEmail.email;
              } else {
                const verifiedEmail = emails.find((e) => e.verified);
                if (verifiedEmail) {
                  userData.email = verifiedEmail.email;
                } else {
                  userData.email = emails[0].email;
                }
              }
            }
          } else {
            const errorData = await emailResponse.json();
            console.error("Failed to fetch emails:", errorData);

            console.warn(
              "Could not access user emails. User may need to make their email public or grant additional permissions."
            );
          }
        } catch (emailError) {
          console.error("Error fetching user emails:", emailError);
        }
      }

      console.log("Final GitHub user data with email:", userData);
      return userData;
    } catch (error) {
      console.error("Error getting GitHub user data:", error);
      throw error;
    }
  }

  async authLogin(code: string): Promise<LoginResponse> {
    try {
      console.log("GitHub login service reached");

      const tokenResponse = await this.getGitHubAccessToken(code);
      if (!tokenResponse.access_token) {
        return {
          success: false,
          message: "Failed to get GitHub access token",
        };
      }

      const userData = await this.getGitHubUserData(tokenResponse.access_token);
      if (!userData.email) {
        return {
          success: false,
          message: "Failed to get user email from GitHub",
        };
      }

      let user = await this._userRepository.findByEmail(userData.email);
      console.log("user", user);

      if (user) {
        await this._userRepository.updateUserProfile(String(user?._id), {
          github: userData.html_url,
        });
      }

      if (!user) {
        const newUser = {
          username: userData.name || userData.login,
          email: userData.email,
          password: "github_oauth",
          status: "Active",
          github: userData.html_url,
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
        message: "GitHub Login Successful",
        data: {
          username: user.username,
          email: user.email,
          github: user?.github,
        },
        access_token,
        refresh_token,
      };
    } catch (error) {
      console.error("GitHub login error:", error);
      return {
        success: false,
        message: "Error occurred during GitHub login",
      };
    }
  }
}
