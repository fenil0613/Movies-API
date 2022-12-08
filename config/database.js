/********************************************************************************************************
*
* ITE5315 – Project
* 
* I declare that this assignment is my own work in accordance with Humber Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Group member Names: Fenilkumar Bhanavadiya, Shally Sharma 
* Student IDs: N01478115, N01474806 
* Date: 1st December 2022 
*
*********************************************************************************************************/

require('dotenv').config();

module.exports = {
    movie_url: process.env.CONNECTION_URL,
    user_url: process.env.USER_CONNECTION
};