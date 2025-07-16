const express = require("express");
const router = new express.Router();
const Products = require("../models/productsSchema");
const USER  = require("../models/userSchema")
const bcrypt = require("bcryptjs");
const authenicate = require("../middleware/authenticate");


  
// get product data api
router.get("/getproducts", async(req, res)=>{
   

    try {
         
        const productsdata = await Products.find();
       // console.log("console the data" + productsdata);
       res.status(201).json(productsdata)
        
    } catch (error) { 
        console.log("error" + error.message);
        
    }
});

// getindividual

router.get("/getproductsone/:id", async (req, res) => {

    try {
        const { id } = req.params;
        //console.log(id);

        const individual = await Products.findOne({ id: id });
        //console.log(individual + "ind mila hai");

        res.status(201).json(individual);
    } catch (error) {
        res.status(400).json(error);
    }
});





// register the data
router.post("/register", async (req, res) => {
    console.log(req.body);
    const { fname, email, mobile, password, cpassword } = req.body;

    if (!fname || !email || !mobile || !password || !cpassword) {
        res.status(422).json({ error: "filll the all details" });
        console.log("no data available");
    };

    try {

        const preuser = await USER.findOne({ email: email });

        if (preuser) {
            res.status(422).json({ error: "This email is already exist" });
        } else if (password !== cpassword) {
            res.status(422).json({ error: "password are not matching" });;
        } else {

            const finaluser = new USER({
                fname, email, mobile, password, cpassword
            });

            // yaha pe hasing krenge

            const storedata = await finaluser.save();
            console.log(storedata + "user successfully added");
            res.status(201).json(storedata);
        }

    } catch (error) {
        console.log("error the bhai catch ma for registratoin time" + error.message);
        res.status(422).send(error);
    }

});



// login data
router.post("/login", async (req, res) => {
    // console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: "fill the details" });
    }

    try {

        const userlogin = await USER.findOne({ email: email });
        console.log(userlogin + "user value");
        if (userlogin) {
            const isMatch = await bcrypt.compare(password, userlogin.password);
            console.log(isMatch);
              
            //token generate
              

            if (!isMatch) {
                res.status(400).json({ error: "invalid crediential pass" });
            } else {
               const token = await userlogin.generatAuthtoken();
                console.log(token);

                res.cookie("eccomerce", token, {
                    expires: new Date(Date.now() + 2589000),
                    httpOnly: true,
                    secure: false, // set to true if using HTTPS
                   sameSite: "Lax"
                  
                });
               
               res.status(201).json(userlogin);
            }

        } else {
            res.status(400).json({ error: "user not exist" });
        }

    } catch (error) {
        res.status(400).json({ error: "invalid crediential pass" });
        console.log("error the bhai catch ma for login time" + error.message);
    }
});

// adding the data into cart
router.post("/addcart/:id", authenicate, async (req, res) => {

    try {
        console.log("perfect 6");
        const { id } = req.params;
        const cart = await Products.findOne({ id: id });
        console.log(cart + "cart milta hain");

        const Usercontact = await USER.findOne({ _id: req.userID });
        console.log(Usercontact + "user milta hain");


        if (Usercontact) {
            const cartData = await Usercontact.addcartdata(cart);

            await Usercontact.save();
            console.log(cartData + " thse save wait kr");
            console.log(Usercontact + "userjode save");
            res.status(201).json(Usercontact);
        }
    } catch (error) {
        console.log(error);
    }
});


// get data into the cart
router.get("/cartdetails", authenicate, async (req, res) => {
    try {
        const buyuser = await USER.findOne({ _id: req.userID });
        console.log(buyuser + "user hain buy pr");
        res.status(201).json(buyuser);
    } catch (error) {
        console.log(error + "error for buy now");
    }
});


// get user is login or not
router.get("/validuser", authenicate, async (req, res) => {
    try {
        const validuserone = await USER.findOne({ _id: req.userID });
        console.log(validuserone + "user hain home k header main pr");
        res.status(201).json(validuserone);
    } catch (error) {
        console.log(error + "error for valid user");
    }
});

// for userlogout

router.get("/logout", authenicate, async (req, res) => {
    try {
        req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
            return curelem.token !== req.token
        });

        res.clearCookie("eccomerce", { path: "/" });
        req.rootUser.save();
        res.status(201).json(req.rootUser.tokens);
        console.log("user logout");

    } catch (error) {
        console.log(error + "jwt provide then logout");
    }
});

// item remove ho rhi hain lekin api delete use krna batter hoga
// remove iteam from the cart

// router.delete("/remove/:id", authenicate, async (req, res) => {
//     try {
//         const { id } = req.params;   //product id mil jayega

//         // req.rootUser.carts = req.rootUser.carts.filter((curel) => {
//         //     return String(curel._id) !== String(id);
//         // });
//          const originalLength = req.rootUser.carts.length;
//     console.log("Incoming ID to remove:", id);
//     console.log("Carts before:", req.rootUser.carts.map(c => c._id));



//                 req.rootUser.carts = req.rootUser.carts.filter(
//             (curel) => String(curel._id) !== String(id)
//         );

//         const newLength = req.rootUser.carts.length;
//         console.log("User carts after:", req.rootUser.carts.map(c => c._id));
//         console.log("Items removed:", originalLength - newLength);

//         req.rootUser.save();
//         res.status(201).json(req.rootUser);
//         console.log("iteam remove");

//     } catch (error) {
//         console.log(error + "jwt provide then remove");
//         res.status(400).json(error);
//     }
// });
// router.delete("/remove/:id",  authenicate, async (req, res) => {
//     try {
//         const user = req.rootUser;
//         const incomingProductId = req.params.id;

//         const originalLength = user.carts.length;

//         // Remove ALL items matching the product id
//         user.carts = user.carts.filter(cartItem => cartItem.id !== incomingProductId);

//         console.log("Items removed:", originalLength - user.carts.length);

//         await user.save();
//         res.status(200).json(user);
//     } catch (err) {
//         console.log("Remove item error:", err);
//         res.status(400).json(err);
//     }
// });


router.delete("/remove/:id", authenicate, async (req, res) => {
    try {
        const user = req.rootUser;
        const incomingProductId = req.params.id;

        const indexToRemove = user.carts.findIndex(cartItem => cartItem.id === incomingProductId);

        if (indexToRemove !== -1) {
            user.carts.splice(indexToRemove, 1);
            console.log("One item removed");
        } else {
            console.log("Item not found");
        }

        await user.save();
        res.status(200).json(user);
    } catch (err) {
        console.log("Remove item error:", err);
        res.status(400).json(err);
    }
});

module.exports = router;