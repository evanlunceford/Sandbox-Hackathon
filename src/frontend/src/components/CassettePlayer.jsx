import "../css/CassettePlayer.css";
import "../css/styles.css";
export default function CassettePlayer({
    onDrop,
    inputRef,
    onInputChange,
    title = "Upload any file",
    hasFile = false,
    loading = false,
}) {
    return (
        <div className="container">
            <div className={`tape${hasFile ? ' has-file' : ''}`}>
            <div className="tape-screws">
                <div className="tape-screw">
                <div className="tape-screw-overflow">
                    <div></div>
                    <div></div>
                </div>
                </div>
                <div className="tape-screw">
                <div className="tape-screw-overflow">
                    <div></div>
                    <div></div>
                </div>
                </div>
                <div className="tape-screw">
                <div className="tape-screw-overflow">
                    <div></div>
                    <div></div>
                </div>
                </div>
                <div className="tape-screw">
                <div className="tape-screw-overflow">
                    <div></div>
                    <div></div>
                </div>
                </div>
            </div>
            <div className="tape-header">
                <div className="tape-title">
                    {title}
                </div>
            </div>
            <div className="tape-body">
                <div className="tape-window">
                <div className="tape-spools">
                    <div className="tape-spool">
                        <div className="tape-spoolbar">
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                    {/* Drop zone */}
                    {!hasFile && (
                        <div
                            className="dropzone"
                            onClick={() => inputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault() }}
                            onDragLeave={() => {}}
                            onDrop={onDrop}
                        >
                            <input
                                ref={inputRef}
                                type="file"
                                accept=".pdf"
                                className="file-input"
                                onChange={onInputChange}
                            />
                            <div className="file-icon-container">
                                {hasFile
                                    ? <img className="file-icon" src="/images/file-uploaded.svg" />
                                    : <img className="file-icon" src="/images/add.svg" />
                                }
                                <p className="file-detail">{hasFile ? 'Ready' : 'Upload Here'}</p>
                            </div>
                        </div>
                    )}

                    <div className="tape-spool">
                        <div className="tape-spoolbar">
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
            <div className="tape-footer">
                <div className="tape-holes">
                <div className="tape-hole tape-hole-radial"></div>
                <div className="tape-hole tape-hole-square"></div>
                </div>
                <div className="tape-screw">
                <div className="tape-screw-overflow">
                    <div></div>
                    <div></div>
                </div>
                </div>
            </div>
            </div>        
        </div>     
    );
}