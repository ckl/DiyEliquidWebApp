using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Security;

namespace DiyELiquidWeb.Helpers
{
    public class MembershipHelper
    {
        public static int? GetUserId()
        {
            if (Membership.GetUser() != null)
                return Membership.GetUser().ProviderUserKey as int?;
            return null;
        }
    }
}