using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using DiyELiquidWeb.Models;
using EntityFramework.Extensions;

namespace DiyELiquidWeb.Controllers
{
    public class FlavorBrandController : Controller
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
        // POST: /GetAllFlavors/
        [HttpPost]
        public ActionResult GetAllFlavors(int flavorBrandId=1)
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
            // TODO: this returns html, find out how to return just a god damn simple string message
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

        // 
        // POST: /UpdateRecipe/
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult UpdateRecipe(Recipe recipe, List<Ingredient> ingredients, List<int> remove)
        {
            if (ingredients == null)
                return Json(null);

            // Update recipe name/desc
            db.Recipes.Update(r => r.Id == recipe.Id,
                              r => new Recipe {Description = recipe.Description, Name = recipe.Name});

            // Remove flavors
            if (remove != null && remove.Count > 0)
            {
                int x = db.Recipe_Flavor.Delete(rf => rf.RecipeId == recipe.Id && remove.Contains(rf.FlavorId));
            }

            // Update existing flavors
            foreach (var ing in ingredients)
            {
                var entry = db.Recipe_Flavor.FirstOrDefault(rf => rf.RecipeId == recipe.Id && rf.FlavorId == ing.FlavorId);

                if (entry == null)
                {
                    // TODO: add Notes
                    var recipeFlavor = new Recipe_Flavor
                        {
                            AmountPercent = ing.Amount,
                            FlavorId = ing.FlavorId,
                            RecipeId = recipe.Id
                        };

                    db.Recipe_Flavor.Add(recipeFlavor);
                }
                else
                {
                    entry.AmountPercent = ing.Amount;
                }
            }

            db.SaveChanges();

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

        //
        // GET: /FlavorBrand/

        public ActionResult Index()
        {
            return View(db.FlavorBrands.ToList());
        }

        //
        // GET: /FlavorBrand/Details/5

        public ActionResult Details(int id = 0)
        {
            FlavorBrand flavorbrand = db.FlavorBrands.Find(id);
            if (flavorbrand == null)
            {
                return HttpNotFound();
            }
            return View(flavorbrand);
        }

        //
        // GET: /FlavorBrand/Create

        public ActionResult Create()
        {
            return View();
        }

        //
        // POST: /FlavorBrand/Create

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(FlavorBrand flavorbrand)
        {
            if (ModelState.IsValid)
            {
                db.FlavorBrands.Add(flavorbrand);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(flavorbrand);
        }

        //
        // GET: /FlavorBrand/Edit/5

        public ActionResult Edit(int id = 0)
        {
            FlavorBrand flavorbrand = db.FlavorBrands.Find(id);
            if (flavorbrand == null)
            {
                return HttpNotFound();
            }
            return View(flavorbrand);
        }

        //
        // POST: /FlavorBrand/Edit/5

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit(FlavorBrand flavorbrand)
        {
            if (ModelState.IsValid)
            {
                db.Entry(flavorbrand).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(flavorbrand);
        }

        //
        // GET: /FlavorBrand/Delete/5

        public ActionResult Delete(int id = 0)
        {
            FlavorBrand flavorbrand = db.FlavorBrands.Find(id);
            if (flavorbrand == null)
            {
                return HttpNotFound();
            }
            return View(flavorbrand);
        }

        //
        // POST: /FlavorBrand/Delete/5

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            FlavorBrand flavorbrand = db.FlavorBrands.Find(id);
            db.FlavorBrands.Remove(flavorbrand);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}