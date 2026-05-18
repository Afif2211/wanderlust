const User = require('../models/user');

//get show - rendering a form for signup
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
}

//post create - creating a new user
module.exports.signup = async (req, res) => {
    try {
        let {username, email, password} = req.body;
        let newUser = new User({ username, email });
        let registration = await User.register(newUser, password);
        // console.log(registration);
        req.login(registration, (err) => { //We are passing the new customer to req.login to get him loggedIn automatically after signup
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to wanderlust!");
            res.redirect('/listings');
        })
    }
    catch (e) {
        req.flash("error", e.message);
        res.redirect('/signup');
    }

}

//show - rendering a form for login
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
}

//post - sending user login details
module.exports.login = async (req, res) => {
        req.flash("success", "Welcome back to Wanderlust!");
        let redirectUrl = res.locals.redirectUrl || "/listings"
        res.redirect(redirectUrl);
}

//logout user
module.exports.logout = (req, res, next) => {
    req.logout((err)=>{
        if(err) {
            return next(err)
        }
        req.flash("success", "You have been logged out!");
        res.redirect('/listings');
    })
}