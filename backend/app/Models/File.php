<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class File extends Model
{
    protected $fillable = [
        'folder_id',
        'department_id',
        'uploaded_by',
        'title',
        'file_name',
        'file_path',
        'mime_type',
        'file_size',
    ];

    public function folder(): BelongsTo
    {
        return $this->belongsTo(Folder::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Transform into the canonical API response shape (FileDTO).
     */
    public function toApiArray(): array
    {
        return [
            'id' => $this->id,

            'fileName' => $this->file_name,

            'title' => $this->title,

            'department' => $this->department
                ? [
                    'id' => $this->department->id,
                    'name' => $this->department->name,
                ]
                : null,

            'folder' => $this->folder
                ? [
                    'id' => $this->folder->id,
                    'name' => $this->folder->name,
                ]
                : null,

            'uploadedBy' => $this->uploader
                ? [
                    'id' => $this->uploader->id,
                    'email' => $this->uploader->email,
                ]
                : null,

            'uploadedAt' => $this->created_at?->toISOString(),
        ];
    }
}