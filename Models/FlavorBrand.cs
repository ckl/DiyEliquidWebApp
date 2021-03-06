﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace DiyELiquidWeb.Models
{
    [Table("FlavorBrand")]
    public class FlavorBrand
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Website { get; set; }
        public string ShortName { get; set; }
    }

    [Table("Recipe")]
    public class Recipe
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }

    [Table("Flavor")]
    public class Flavor
    {
        public int Id { get; set; }
        public string Name { get; set; }

        [ForeignKey("FlavorBrandId")]
        public virtual FlavorBrand FlavorBrand { get; set; }
        public int FlavorBrandId { get; set; }
        public string Notes { get; set; }
    }

    [Table("Recipe_Flavor")]
    public class Recipe_Flavor
    {
        public int Id { get; set; }
        public double AmountPercent { get; set; }
        public string Notes { get; set; }

        [ForeignKey("RecipeId")]
        public virtual Recipe Recipe { get; set; }
        public int RecipeId { get; set; }

        [ForeignKey("FlavorId")]
        public virtual Flavor Flavor { get; set; }
        public int FlavorId { get; set; }
    }

    [Table("Users_Flavors")]
    public class Users_Flavors
    {
        public int Id { get; set; }

        [ForeignKey("UserId")]
        public virtual Users User { get; set; }
        public int UserId { get; set; }

        [ForeignKey("FlavorId")]
        public virtual Flavor Flavor { get; set; }
        public int FlavorId { get; set; }
    }

    public class DiyELiquidContext : DbContext
    {
        public DiyELiquidContext() : base("DiyELiquidDbConnection")
        {
        }

        public DbSet<FlavorBrand> FlavorBrands { get; set; }
        public DbSet<Recipe> Recipes { get; set; }
        public DbSet<Flavor> Flavors { get; set; }
        public DbSet<Recipe_Flavor> Recipe_Flavor { get; set; }
        public DbSet<Users_Flavors> Users_Flavors { get; set; }

        public DbSet<Users> Users { get; set; }
    }

    // TODO: move this somewhere else. it's used by the Controller for getting a custom object from addRecipeController
    public class Ingredient
    {
        public int FlavorId { get; set; }
        public string FlavorName { get; set; }
        public double Amount { get; set; }
    }

    public class RecipeJson
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public List<Ingredient> Ingredients { get; set; }
    }

    public class MyFlavorJson
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsOwned { get; set; }
    }

    public class FlavorsByBrandJson
    {
        public int FlavorBrandId { get; set; }
        public string FlavorBrandName { get; set; }
        public string ShortName { get; set; }
        public string Website { get; set; }
        public List<MyFlavorJson> Flavors { get; set; } 
    }
}