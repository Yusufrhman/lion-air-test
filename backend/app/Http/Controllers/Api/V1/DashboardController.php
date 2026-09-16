<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\File;
use App\Models\Folder;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * GET /api/v1/dashboard
     */
    public function index(): JsonResponse
    {
        $latestFiles = File::query()
            ->latest('created_at')
            ->limit(10)
            ->get();

        return response()->json([
            'data' => [
                'latest_files' => $latestFiles,
                'total_folders' => Folder::count(),
                'total_files' => File::count(),
                'total_departments' => Department::count(),
            ],
        ]);
    }
}