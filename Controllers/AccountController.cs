using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using DiyELiquidWeb.Models;
using WebMatrix.WebData;

namespace DiyELiquidWeb.Controllers
{
    public class AccountController : Controller
    {
        [HttpGet]
        public ActionResult InsufficientPermissions()
        {
            Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            return Json("Sorry, you do not have sufficient permissions to perform the requested action", JsonRequestBehavior.AllowGet);
        }

        //
        // POST: /Account/Register
        [HttpPost]
        public ActionResult Register(string username, string password, string email)
        {
            //InitializeDatabaseConnection();

            bool bError = false;
            var errorMsg = new StringBuilder();

            if (username == null)
            {
                bError = true;
                errorMsg.Append("Please provide a username");
            }

            if (password == null)
            {
                bError = true;
                errorMsg.Append("Please provide a password");
            }

            if (email == null)
            {
                bError = true;
                errorMsg.Append("Please provide an email");
            }

            // See if the user exists
            var membership = (SimpleMembershipProvider)Membership.Provider;
            if (membership.GetUser(username, userIsOnline: false) != null)
            {
                bError = true;
                errorMsg.Append("Username is already taken, please try another");
            }

            if (bError)
            {
                Response.StatusCode = (int) HttpStatusCode.InternalServerError;
                return Json(errorMsg.ToString());
            }

            try
            {
                
                using (DiyELiquidContext context = new DiyELiquidContext())
                {
                    Users users = new Users
                        {
                            UserName = username,
                            DisplayName = username,
                            Email = email,
                            IsActive = true
                        };

                    context.Users.Add(users);
                    context.SaveChanges();
                }

                WebSecurity.CreateAccount(username, password, false);

                // Give them the 'User' role
                AddUserToRole(username, "User");

                WebSecurity.Login(username, password);
            }
            catch (Exception ex)
            {
                Response.StatusCode = (int) HttpStatusCode.InternalServerError;
                return Json(ex.Message);
            }

            return Json(null);
        }

        [HttpPost]
        public ActionResult Login(string username, string password, bool rememberme)
        {
            //InitializeDatabaseConnection();

            bool success = false;

            try
            {
                success = WebSecurity.Login(username, password, persistCookie: rememberme);

            }
            catch (Exception ex)
            {
                Response.StatusCode = (int) HttpStatusCode.InternalServerError;
                return Json("Error: " + ex.Message);
            }


            if (!success)
            {
                Response.StatusCode = (int) HttpStatusCode.InternalServerError;
                return Json("Error: Invalid username or password");
            }

            // If we made it this far, everything is good. return a list of the user's roles
            var roleProvider = (SimpleRoleProvider) Roles.Provider;
            List<string> roles = roleProvider.GetRolesForUser(username).ToList();

            return Json(roles);
        }

        [HttpPost]
        public ActionResult Logout()
        {
            WebSecurity.Logout();
            return Json(null);
        }

        [HttpPost]
        public ActionResult IsLoggedIn()
        {
            return Json(WebSecurity.CurrentUserId != -1);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult CreateRole(string roleName)
        {
            var roles = (SimpleRoleProvider) Roles.Provider;

            if (! roles.RoleExists(roleName))
            {
                roles.CreateRole(roleName);
            }

            return Json(null);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult AddUserToRole(string username, string rolename)
        {
            var roles = (SimpleRoleProvider) Roles.Provider;
            var membership = (SimpleMembershipProvider)Membership.Provider;

            if (membership.GetUser(username, false) != null)
            {
                if (!roles.GetRolesForUser(username).Contains(rolename))
                {
                    roles.AddUsersToRoles(new[] {username}, new[] {rolename});
                }
            }
            else
            {
                Response.StatusCode = (int) HttpStatusCode.InternalServerError;
                return Json("Username " + username + " not found");
            }

            return Json(null);
        }
    }
}
