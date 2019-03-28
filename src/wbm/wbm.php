<?php 
/******************************************************************************/
/*  Web Behaviour Monitoring Tool - wbm.php                                   */
/*                                                                            */
/*  This script acts as a server and receives the POST data from the JS       */
/*  script. It then stores that data in a file on the server.                 */
/*                                                                            */
/*  @author Hugo Gamboa <h.gamboa@fct.unl.pt>                                 */
/*  @contributor Ricardo Tonet <ribeiro.tonet@gmail.com>                      */
/*  @contributor Catia Cepeda <catiamcepeda@gmail.com>                        */
/******************************************************************************/

$json   = json_decode($_POST['json'], true);  // Get POST data
$ip     = $_SERVER['REMOTE_ADDR'];            // Get server IP

// Open the file for appending and write the data. Close the file at the end.
$myfile = fopen(getcwd()."/data/".$ip.'_'.$json['file'].'.txt', "a+");
fwrite($myfile, $json['data']);
fclose($myfile);