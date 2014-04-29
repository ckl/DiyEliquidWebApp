using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using DiyELiquidWeb.Helpers;
using DiyELiquidWeb.Models;
using EntityFramework.Extensions;

namespace DiyELiquidWeb.Controllers
{
    public class FlavorController : Controller
    {
        private DiyELiquidContext db = new DiyELiquidContext();

        //
        // POST: /GetAll/
        [HttpPost]
        public ActionResult GetAll()
        {
            var response = (from f in db.FlavorBrands select f).ToList();

            return Json(response);
        }

        //
        // POST: /GetRecipe/id
        [HttpPost]
        public ActionResult GetRecipe(int id)
        {
            var recipe = (from r in db.Recipes
                          where r.Id == id
                          select r).FirstOrDefault();

            var ingredients = (from r in db.Recipe_Flavor
                               where r.RecipeId == id
                               select r).ToList();

            RecipeJson response = null;
            if (recipe != null)
            {

                List<Ingredient> ingredientsJson = ingredients.Select(ing => new Ingredient
                    {
                        FlavorId = ing.FlavorId, FlavorName = ing.Flavor.Name, Amount = ing.AmountPercent
                    }).ToList();

                response = new RecipeJson
                    {
                        Id = recipe.Id,
                        Name = recipe.Name,
                        Description = recipe.Description,
                        Ingredients = ingredientsJson
                    };

            }

            return Json(response);
        }
        
        //
        // POST: /SearchRecipe/<name>
        [HttpPost]
        public ActionResult SearchRecipe(string search="")
        {
            var response = (from r in db.Recipes
                            where r.Name.Contains(search)
                            select r).ToList();

            return Json(response);
        }

        //
        // POST: /SearchRecipeByIngredient/
        [HttpPost]
        public ActionResult SearchRecipeByIngredient(List<int> flavors, int numMissingFlavors)
        {
            var matchingRecipes = new List<Recipe>();

            // TODO: there's probably a more efficent, linq-only way to do this
            // First get all recipes
            var recipes = (from r in db.Recipes select r).ToList();

            // for each recipe, make sure each of its flavors is in our List<int> flavors. If not, increment numMissing
            foreach (var recipe in recipes)
            {
                int numMissing = 0;
                // get all the flavors for this recipe
                var recipeFlavors = (from rf in db.Recipe_Flavor
                               where rf.RecipeId == recipe.Id
                               select rf).ToList();

                foreach (var flavor in recipeFlavors)
                {
                    if (flavors == null || !flavors.Contains(flavor.FlavorId))
                        numMissing++;
                }

                if (numMissing <= numMissingFlavors)
                    matchingRecipes.Add(recipe);
            }

            return Json(matchingRecipes);
        }

        

        //
        // POST: /GetAllFlavors
        [HttpPost]
        public ActionResult GetAllFlavors()
        {
            //var results = new Dictionary<FlavorBrand, List<MyFlavorJson>>();
            var results = new List<FlavorsByBrandJson>();
            var owned = new List<int>();

            try
            {
                // TODO: probably a better way to do this in linq
                // First get all owned flavors
                var userId = MembershipHelper.GetUserId();

                if (userId != null)
                {
                    owned = (from uf in db.Users_Flavors
                                 where uf.UserId == userId
                                 select uf.FlavorId).ToList<int>();
                }


                var flavorBrands = (from fb in db.FlavorBrands
                                    select fb).ToList();

                foreach (var fb in flavorBrands)
                {
                    var flavors = (from fl in db.Flavors
                                   where fl.FlavorBrandId == fb.Id
                                   select new MyFlavorJson {Id = fl.Id, Name = fl.Name }).OrderBy(x => x.Name).ToList();

                    // Compare with owned flavors
                    if (userId != null) {
                        foreach (var f in flavors)
                        {
                            if (owned.Contains(f.Id))
                                f.IsOwned = true;
                        }
                    }

                    //results.Add(new FlavorBrand {Id = fb.Id, Name = fb.Name, Website = fb.Website}, flavors);
                    results.Add(new FlavorsByBrandJson
                        {
                            FlavorBrandId = fb.Id,
                            FlavorBrandName = fb.Name,
                            ShortName = fb.ShortName,
                            Website = fb.Website,
                            Flavors = flavors
                        });
                }
            }
            catch (Exception ex)
            {
                Response.StatusCode = (int) HttpStatusCode.InternalServerError;
                return Json(ex.Message);
            }


            return Json(results);
        }

        //
        // POST: /GetFlavorsForUser
        [Authorize(Roles = "User")]
        public ActionResult GetFlavorsForUser()
        {
            // TODO: move this code into a helper
            // First get their UserId
            var userId = MembershipHelper.GetUserId();

            if (userId == null)
            {
                Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                return Json("Error: You must be logged in to perform this action");
            }


            var results = new List<FlavorsByBrandJson>();

            var owned = (from uf in db.Users_Flavors
                         where uf.UserId == userId
                         select uf).ToList();

            var dict = new Dictionary<int, List<MyFlavorJson>>();
            foreach (var o in owned)
            {
                var key = o.Flavor.FlavorBrandId;

                if (! dict.ContainsKey(key))
                    dict.Add(key, new List<MyFlavorJson>());

                dict[key].Add(new MyFlavorJson
                    {
                        Id = o.FlavorId,
                        Name = o.Flavor.Name,
                        IsOwned = true
                    });
            }

            foreach (var item in dict)
            {
                results.Add(new FlavorsByBrandJson
                    {
                        FlavorBrandId = item.Key,
                        Flavors = item.Value
                    });
            }

            return Json(results);

        }

        //
        // POST: /UpdateUserFlavor/List<int>add, List<int> remove
        [HttpPost]
        [Authorize(Roles = "User")]
        public ActionResult UpdateUserFlavor(List<int> addList, List<int> remList)
        {
            // First get their UserId
            var userId = MembershipHelper.GetUserId();

            if (userId == null)
            {
                Response.StatusCode = (int) HttpStatusCode.InternalServerError;
                return Json("Error: You must be logged in to perform this action");
            }

            // Remove flavors
            if (remList != null && remList.Count > 0)
            {
                db.Users_Flavors.Delete(uf => uf.UserId == userId && remList.Contains(uf.FlavorId));
            }

            // Add new flavors
            if (addList != null && addList.Count > 0)
            {
                foreach (var id in addList)
                {
                    var entry = new Users_Flavors
                        {
                            FlavorId = id,
                            UserId = Convert.ToInt32(userId)
                        };

                    db.Users_Flavors.Add(entry);
                }

                db.SaveChanges();
            }

            return Json(null);
        }

        //
        // POST: /GetAllFlavorsByBrand/
        [HttpPost]
        public ActionResult GetAllFlavorsByBrand(int flavorBrandId=1)
        {
            var response = (from f in db.Flavors
                            where f.FlavorBrandId == flavorBrandId
                            select f).ToList();

            return Json(response);
        }

        //
        // POST: /AddFlavor/
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult AddFlavor(string flavorName, string notes, int flavorBrandId=1)
        {
            // First see if the flavor name already exists
            try
            {
                var flavor = (from fl in db.Flavors
                              where fl.Name == flavorName && fl.FlavorBrandId == flavorBrandId
                              select fl).FirstOrDefault();

                if (flavor != null)
                {
                    return new HttpStatusCodeResult(500, "Flavor already exists for chosen brand");
                }
            }
            catch (Exception ex)
            {
                Response.StatusCode = (int) HttpStatusCode.InternalServerError;
                return Json(ex.Message);
            }
            
            

            Flavor f = null;

            if (flavorName != null)
            {
                f = new Flavor
                    {
                        Name = flavorName,
                        Notes = notes,
                        FlavorBrandId = 1   // TODO: add this to Ingredient later. Assuming TFA for now because that's all I have and care about
                    };

                f = db.Flavors.Add(f);
                db.SaveChanges();
            }

            return Json(f);
        }

        //
        // POST: /AddRecipe/
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult AddRecipe(string name, string description, List<Ingredient> ingredients)
        {
            // See if an identical recipe exists already
            // TODO

            // First add the recipe to the Recipe table
            if (name != null)
            {
                var recipe = new Recipe
                    {
                        Name = name,
                        Description = description
                    };

                recipe = db.Recipes.Add(recipe);
                db.SaveChanges();

                // Associate each ingredient to the recipe by adding a row to the Recipe_Flavor (intersect) table
                foreach (var ing in ingredients)
                {
                    var recipeFlavor = new Recipe_Flavor
                        {
                            RecipeId = recipe.Id,
                            FlavorId = ing.FlavorId,
                            AmountPercent = ing.Amount, // TODO: add notes to Ingredit and addRecipeController
                        };

                    db.Recipe_Flavor.Add(recipeFlavor);
                    db.SaveChanges();
                }
            }

            

            return Json(null);
        }

        [HttpPost]
        [Authorize(Roles = "User")]
        public ActionResult UpdateRecipe(Recipe recipe, List<Ingredient> flavors)
        {
            // First get their UserId
            var userId = MembershipHelper.GetUserId();

            if (userId == null)
            {
                Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                return Json("Error: You must be logged in to perform this action");
            }

            try
            {
                // Update the name and description
                db.Recipes.Update(r => r.Id == recipe.Id,
                                  r => new Recipe {Description = recipe.Description, Name = recipe.Name});

                // Remove existing flavors
                int x = db.Recipe_Flavor.Delete(rf => rf.RecipeId == recipe.Id);

                // Add in new flavors
                foreach (var fl in flavors)
                {
                    // TODO: add Notes
                    var recipeFlavor = new Recipe_Flavor
                        {
                            AmountPercent = fl.Amount,
                            FlavorId = fl.FlavorId,
                            RecipeId = recipe.Id
                        };

                    db.Recipe_Flavor.Add(recipeFlavor);
                }

                db.SaveChanges();
            }
            catch (Exception ex)
            {
                Response.StatusCode = (int) HttpStatusCode.InternalServerError;
                return Json("Error: " + ex.Message);
            }

            return Json(null);
        }


        //
        // POST: /DeleteRecipe/
        [HttpPost]
        public ActionResult DeleteRecipe(int recipeId)
        {
            string response = null;

            try
            {
                db.Recipe_Flavor.Delete(rf => rf.RecipeId == recipeId);
                db.Recipes.Delete(r => r.Id == recipeId);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                Response.StatusCode = (int) HttpStatusCode.InternalServerError;
                response = "Error: " + ex.Message;
            }

            return Json(response);
        }

        // 
        // POST: /GetIngredients/id
        [HttpPost]
        public ActionResult GetIngredients(int recipeId)
        {
            var response = (from i in db.Recipe_Flavor
                            where i.RecipeId == recipeId
                            select i).ToList();

            return Json(response);
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}