<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\File;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class FileController extends Controller
{
    /**
     * GET /api/v1/files
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->integer('perPage', 10);

        // Minimum 1, maximum 100
        $perPage = min(max($perPage, 1), 100);

        $query = File::query()
            ->with([
                'department:id,name',
                'folder:id,name',
                'uploader:id,email',
            ]);

        /*
        Search by file name or title
        */

        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where(function ($query) use ($search) {
                $query->where('file_name', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%");
            });
        }

        /*
        Filter by department
        */

        if ($request->filled('departmentId')) {
            $query->where(
                'department_id',
                $request->integer('departmentId')
            );
        }

        /*
        Paginate files
        */

        $files = $query
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'data' => $files->getCollection()
                ->map(fn(File $file) => $file->toApiArray())
                ->values(),

            'meta' => [
                'currentPage' => $files->currentPage(),
                'perPage' => $files->perPage(),
                'total' => $files->total(),
            ],
        ]);
    }

    /**
     * POST /api/v1/files
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'departmentId' => [
                'required',
                'integer',
                'exists:departments,id',
            ],

            'folderId' => [
                'required',
                'integer',
                'exists:folders,id',
            ],

            'file' => [
                'required',
                'file',
                'max:10240',
                'mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg',
            ],
        ]);

        $uploadedFile = $request->file('file');

        /*
        Store physical file
        */

        $filePath = $uploadedFile->store('files');

        try {
            /*
            Create database record
            */

            $file = File::create([
                'folder_id' => $validated['folderId'],
                'department_id' => $validated['departmentId'],

                // Never take this from frontend
                'uploaded_by' => $request->user()->id,

                'title' => $validated['title'],
                'file_name' => $uploadedFile->getClientOriginalName(),
                'file_path' => $filePath,
                'mime_type' => $uploadedFile->getMimeType(),
                'file_size' => $uploadedFile->getSize(),
            ]);

            $file->load([
                'department:id,name',
                'folder:id,name',
                'uploader:id,email',
            ]);

            return response()->json([
                'message' => 'File uploaded successfully.',
                'data' => $file->toApiArray(),
            ], Response::HTTP_CREATED);
        } catch (Throwable $exception) {
            /*
            Rollback physical file
            */

            Storage::delete($filePath);

            throw $exception;
        }
    }

    /**
     * GET /api/v1/files/{id}
     */
    public function show(string $id): JsonResponse
    {
        $file = File::findOrFail($id);
        $file->load([
            'department:id,name',
            'folder:id,name',
            'uploader:id,email',
        ]);

        return response()->json([
            'data' => $file->toApiArray(),
        ]);
    }

    /**
     * PATCH /api/v1/files/{id}
     */
    public function update(
        Request $request,
        string $id
    ): JsonResponse {
        $file = File::findOrFail($id);
        $validated = $request->validate([
            'title' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'departmentId' => [
                'sometimes',
                'required',
                'integer',
                'exists:departments,id',
            ],

            'folderId' => [
                'sometimes',
                'required',
                'integer',
                'exists:folders,id',
            ],
        ]);

        if (array_key_exists('title', $validated)) {
            $file->title = $validated['title'];
        }

        if (array_key_exists('departmentId', $validated)) {
            $file->department_id = $validated['departmentId'];
        }

        if (array_key_exists('folderId', $validated)) {
            $file->folder_id = $validated['folderId'];
        }

        $file->save();

        $file->load([
            'department:id,name',
            'folder:id,name',
            'uploader:id,email',
        ]);

        return response()->json([
            'message' => 'File updated successfully.',
            'data' => $file->toApiArray(),
        ]);
    }

    /**
     * DELETE /api/v1/files/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $file = File::findOrFail($id);

        /*
        Save path before deleting database record
        */

        $filePath = $file->file_path;

        /*
        Delete database record
        */

        $file->delete();

        /*
        Delete physical file
        */

        if (Storage::exists($filePath)) {
            Storage::delete($filePath);
        }

        return response()->json([
            'message' => 'File deleted successfully.',
        ]);
    }

    /**
     * GET /api/v1/files/{id}/download
     */
    public function download(string $id)
    {
        $file = File::findOrFail($id);

        if (!Storage::exists($file->file_path)) {
            return response()->json([
                'message' => 'Physical file not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        return Storage::download(
            $file->file_path,
            $file->file_name,
            [
                'Content-Type' => $file->mime_type,
            ]
        );
    }

}