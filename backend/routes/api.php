<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\DepartmentController;
use App\Http\Controllers\Api\V1\FileController;
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

        /*
        |--------------------------------------------------------------------------
        | Department Routes
        |--------------------------------------------------------------------------
        */

        // Viewer + Administrator
        Route::get('/departments', [DepartmentController::class, 'index']);

        // Administrator only
        Route::middleware('administrator')->group(function () {

            Route::post('/departments', [DepartmentController::class, 'store']);

            Route::patch('/departments/{id}', [DepartmentController::class, 'update']);

            Route::delete('/departments/{id}', [DepartmentController::class, 'destroy']);

        });

        /*
        |--------------------------------------------------------------------------
        | File Routes
        |--------------------------------------------------------------------------
        */

        // Administrator + Viewer
        Route::get('/files', [FileController::class, 'index']);

        Route::get('/files/{id}', [FileController::class, 'show']);

        Route::get(
            '/files/{id}/download',
            [FileController::class, 'download']
        );


        // Administrator Only
        Route::middleware('administrator')->group(function () {
            Route::post('/files', [FileController::class, 'store']);

            Route::patch(
                '/files/{id}',
                [FileController::class, 'update']
            );

            Route::delete(
                '/files/{id}',
                [FileController::class, 'destroy']
            );
        });
        /*
        |--------------------------------------------------------------------------
        | Dashboard Routes
        |--------------------------------------------------------------------------
        */
        Route::get('/dashboard', [DashboardController::class, 'index'])
            ->middleware('administrator');
    });

});