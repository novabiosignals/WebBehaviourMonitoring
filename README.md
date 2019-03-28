# Web Behaviour Monitoring

WBM.js is a simple tool to monitor user behaviour during web-driven scientific experiments. It acquires data associated to mouse and keyboard events.

## Installation

### On a remote server

If you have a web page or webapp that you want to monitor on a remote server, put the WBM files and folders (**src/wbm** and **src/wbm.js**) on the server via FTP. The folder **src/wbm** should be copied to the project root. Give the folder **[PROJECT_ROOT]/wbm/data** write permissions to the Apache2/NGINX user. Include the JS file on the main HTML file *head* tag:

```
<script type="text/javascript" src="path/to/the/file/wbm.js"></script>
```

### On localhost (personal computer)
If you want to run the tool on your personal computer you need to have a HTTP server running so that the **wbm.php** file runs. You can use either Apache or NGINX. We suggest Apache because it has more information available on the web and it is easier to setup. If you are on Windows or MAC, we suggest to install WAMP or MAMP, respectively. If using Linux, install the LAMP stack.

#### Using Windows - Install WAMP
To install and configure WAMP, follow [these instructions](https://www.makeuseof.com/tag/how-to-set-up-your-own-wampserver/).

#### Using MAC - Install MAMP
To install and configure MAMP, follow [these instructions](https://www.betterhostreview.com/install-mamp-mac.html).

#### Using Ubuntu Linux - Install LAMP
If using the LAMP stack, follow these instructions (based on this [tutorial](https://www.howtoforge.com/tutorial/install-apache-with-php-and-mysql-on-ubuntu-18-04-lamp/)) to install and setup Apache and PHP 7.2 on a Ubuntu Linux (we will not install MySQL or/and MariaDB because to use **wbm.php** the database is not needed). If you have another Linux distro, search for instructions on how to install the LAMP stack.

**1. Install Apache2**
```
sudo apt-get -y install apache2
```
To test the installation, open a browser and write *http://localhost/* on the URL bar. You should see the Apache Ubuntu Default Page.

**2. Install PHP 7.2**

Install PHP and Apache PHP module.
```
sudo apt-get -y install php7.2 libapache2-mod-php7.2
```
Restart Apache.
```
sudo systemctl restart apache2
```
**3. Test PHP installation**

The document root folder for Apache on Ubuntu is **/var/www/html**. Create a file info.php on this folder with the following content:
```
<?php 
phpinfo();
```
Go to the URL *http://localhost/info.php* and if everything is well installed you should see the a page with all the information about your PHP installation.

#### Install WBM

After installing WAMP, MAMP or LAMP create a new folder inside Apache document root for your project. Copy your project files to that folder and copy the WBM files and folders (**src/wbm** and **src/wbm.js**) to your file structure. The folder **src/wbm** should be copied to the project root. Change the folder owner and group to *www-data*. Include the JS file on the main HTML file *head* tag:
```
<script type="text/javascript" src="path/to/the/file/wbm.js"></script>
```

## Usage

Everytime you access the main HTML file via the web browser the user behaviour (mouse and keyboard events) is sent to the server and stored on the folder **[PROJECT_ROOT]/wbm/data**. The data file follows a naming convention: 

**[_Server IP_]_[_URL Host_]_[_URL Path_]_[_Optional identification string_].txt**

If the Server IP, URL Host and URL Path are not enough to univocally identifiy each acquisition block, you can edit the function **fileIdString()** on the wbm.js file to return an optional customized identification string to be appended to the file name after the URL Path.

```
function fileIdString()
{
  var str = '';

  // Add your code here

  return (str === '') ? str : '_'+str;
}
```

Inside the file, the data is organized in the following way:

**Header** (not printed on the file) \
\#[Timestamp] [WBM version] \
\#[Timestamp] [*window.screen* data] \
\#[Timestamp] [*window.navigator* data] \
**Data** (not printed on the file) \
[Counter] [Event Code] [ObjectID] [MouseX] [MouseY] [MouseX + ScrollLeft] [MouseY + ScrollTop] [Keyboard Code]  [Shift] [Alt] [Ctrl] [Timestamp] \
...

## Contributors

![Hugo Gamboa](https://avatars3.githubusercontent.com/u/669947?s=40&v=4) [Hugo Gamboa](https://github.com/hgamboa)
![Ricardo Tonet](https://avatars1.githubusercontent.com/u/1868045?s=40&v=4) [Ricardo Tonet](https://github.com/blackchacal)
![Catia Cepeda](https://avatars2.githubusercontent.com/u/9532534?s=40&v=4)[Catia Cepeda](https://github.com/catiamcepeda)

## License

GPLv2