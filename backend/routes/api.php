<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\FolderController;

Route::prefix('v1')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Public Routes
    |--------------------------------------------------------------------------
    */

    Route::post('/login', [AuthController::class, 'login']);


    /*
    |--------------------------------------------------------------------------
    | Authenticated Routes
    |--------------------------------------------------------------------------
    */

    Route::middleware('auth:sanctum')->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Authentication
        |--------------------------------------------------------------------------
        */

        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);


        /*
        |--------------------------------------------------------------------------
        | Folder Routes
        |--------------------------------------------------------------------------
        */

        // Viewer + Administrator
        Route::get('/folders', [FolderController::class, 'index']);
        Route::get('/folders/{id}', [FolderController::class, 'show']);


        // Administrator only
        Route::middleware('administrator')->group(function () {

            Route::post('/folders', [FolderController::class, 'store']);

            Route::patch('/folders/{id}', [FolderController::class, 'update']);

            Route::delete('/folders/{id}', [FolderController::class, 'destroy']);
        });

    });

});