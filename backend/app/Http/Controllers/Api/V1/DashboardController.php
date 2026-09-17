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
            ->with([
                'department:id,name',
                'folder:id,name',
                'uploader:id,email',
            ])
            ->latest('created_at')
            ->limit(10)
            ->get();

        return response()->json([
            'data' => [
                'latestFiles' => $latestFiles
                    ->map(fn(File $file) => $file->toApiArray())
                    ->values(),

                'totalFolders' => Folder::count(),

                'totalFiles' => File::count(),

                'totalDepartments' => Department::count(),
            ],
        ]);
    }
}
