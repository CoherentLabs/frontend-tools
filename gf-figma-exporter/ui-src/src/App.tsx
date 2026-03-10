import { createSignal, onMount, Show, type Component } from 'solid-js';

import styles from './App.module.css';
import MessageBus from './MessageBus/MessageBus';
import downloadPages from './listeners/download-pages';
import flattenSVG from './listeners/flatten-svg';
import PathBBox from './listeners/path-bbox';
import { ExportMode, GFFont } from './commonTypes';
import toast, { Toaster } from 'solid-toast';

const App: Component = () => {
    const [exportMode, setExportMode] = createSignal<ExportMode>('page');
    const [exportStarted, setExportStarted] = createSignal(false);
    const [exportProgress, setExportProgress] = createSignal(0);
    const [exportMessage, setExportMessage] = createSignal('');
    const [missingFonts, setMissingFonts] = createSignal<GFFont>({});
    const [fontFiles, setFontFiles] = createSignal<{ [fileName: string]: Uint8Array }>({});

    const handleExportClick = () => {
        setExportStarted(true);
        MessageBus.postMessage('start-export', { mode: exportMode() });
    };

    const handleContinueWithFallback = () => {
        toast.custom(
            (t) => (
                <div class={styles.ToastContainer} style={{ 'border-left': '6px solid #F5BC35' }}>
                    Warning! By continuing, the export will use Noto Sans as a fallback for all missing fonts.
                    <div>
                        <button
                            class={`${styles.ToastCloseButton} ${styles.FooterButtonRed}`}
                            onClick={() => {
                                toast.dismiss(t.id);
                            }}
                        >
                            Go Back
                        </button>
                        <button
                            class={styles.ToastCloseButton}
                            onClick={() => {
                                MessageBus.postMessage('MISSING_FONTS_RESPONSE', { fonts: missingFonts() });
                                setMissingFonts({});
                                toast.dismiss(t.id);
                            }}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            ),
            {
                duration: Infinity,
                unmountDelay: 0,
            }
        );
    };

    const handleError = (message: string) => {
        toast.error(`Error: ${message}\n Contact Support at frontend@coherent-labs.com for more information`, { duration: Infinity, unmountDelay: 0 });
    };

    const handleSelectedFontsClick = () => {
        const selects = document.querySelectorAll('select');
        const mappedFonts: GFFont = Object.assign({}, missingFonts());
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        const files = input.files;

        const selectValues = [...selects].map((select) => (select as HTMLSelectElement).value);

        if (selectValues.some((value) => value === '')) {
            toast.error('Please map all missing fonts before continuing.', { duration: 4000 });
            return;
        }

        const needsUploadedFile = selectValues.some((value) => value !== 'noto');
        if (needsUploadedFile && (!files || files.length === 0)) {
            toast.error('Please upload font files before continuing.', { duration: 4000 });
            return;
        }

        const readFiles = files && files.length > 0 ? readFilesAsArrayBuffer(files) : Promise.resolve();

        readFiles.then(() => {
            selects.forEach((select) => {
                const [family, weight, style, subset] = select.name.split('_');
                const fileName = select.value === 'noto' ? null : select.value;

                mappedFonts[family][weight][style].subsets[subset] = fileName ? fontFiles()[fileName] : null;
            });

            MessageBus.postMessage('MISSING_FONTS_RESPONSE', { fonts: mappedFonts });
            setMissingFonts({});
        });
    };

    const readFilesAsArrayBuffer = (files: FileList): Promise<void> => {
        const promises = Array.from(files).map((file) => {
            return new Promise<void>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const arrayBuffer = reader.result as ArrayBuffer;
                    setFontFiles((prev) => ({
                        ...prev,
                        [file.name]: new Uint8Array(arrayBuffer),
                    }));
                    resolve();
                };
                reader.onerror = reject;
                reader.readAsArrayBuffer(file);
            });
        });

        return Promise.all(promises).then(() => {});
    };

    const handleMissingFontInputChange = (e: Event & { target: HTMLInputElement }) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const selects = document.querySelectorAll('select');

        for (let i = 0; i < selects.length; i++) {
            const select = selects[i] as HTMLSelectElement;
            const fileOptions = Array.from(files).map((file) => file.name);

            // Clear existing options
            select.innerHTML =
                '<option value="">-- Select a font file --</option><option value="noto">Noto Sans</option>';

            // Add new options
            fileOptions.forEach((fileName) => {
                const option = document.createElement('option');
                option.value = fileName;
                option.text = fileName;
                select.appendChild(option);
            });
        }
    };

    onMount(() => {
        // @ts-expect-error MessageBus on uses unknown data type
        MessageBus.on('download-files', downloadPages);
        // @ts-expect-error MessageBus on uses unknown data type
        MessageBus.on('flatten-svg', flattenSVG);
        // @ts-expect-error MessageBus on uses unknown data type
        MessageBus.on('path-bbox', PathBBox);

        MessageBus.on('MISSING_FONTS_DETECTED', (data) => {
            const { fonts } = data as { fonts: GFFont };
            setMissingFonts(fonts);
        });

        MessageBus.on('export-progress', (data) => {
            const { name, progress } = data as { name: string; progress: number };
            setExportProgress(progress);
            setExportMessage(`${name}: ${progress.toFixed(2)}%`);
        });

        MessageBus.on('ERROR', (data) => {
            const { message } = data as { message: string };
            handleError(message);
        });
    });

    return (
        <div class={styles.App}>
            <div class={styles.Logo}></div>
            <div class={styles.StartingText}>
                {Object.keys(missingFonts()).length === 0
                    ? exportStarted()
                        ? 'Exporting in progress...'
                        : 'Press the button to get started'
                    : 'Export Paused: Missing Fonts.'}
            </div>
            <Show when={!exportStarted()}>
                <div class={styles.ModeToggle}>
                    <div
                        class={`${styles.ModeToggleOption} ${exportMode() === 'page' ? styles.ModeToggleOptionActive : ''}`}
                        onClick={() => setExportMode('page')}
                    >
                        Pages
                    </div>
                    <div
                        class={`${styles.ModeToggleOption} ${exportMode() === 'component' ? styles.ModeToggleOptionActive : ''}`}
                        onClick={() => setExportMode('component')}
                    >
                        Components
                    </div>
                </div>
            </Show>
            <div class={styles.ButtonContainer}>
                <div
                    class={`${styles.Button} ${exportStarted() ? styles.TriggeredButton : ''}`}
                    onClick={handleExportClick}
                >
                    {exportStarted() ? '' : 'Export'}
                    <div class={styles.Progress}>
                        <div
                            class={styles.ProgressBar}
                            style={{
                                width: `${exportProgress()}%`,
                                background: `${
                                    Object.keys(missingFonts()).length === 0
                                        ? 'linear-gradient(to right, #3e42b8, #4b9ae6, #00dcff)'
                                        : '#F5BC35'
                                }`,
                            }}
                        ></div>
                    </div>
                </div>
                <div class={styles.ProgressText}>{exportMessage()}</div>
            </div>
            <Show when={Object.keys(missingFonts()).length > 0}>
                <div class={styles.MissingFontsContainer}>
                    <div class={styles.MissingFontsText}>Missing Fonts Detected</div>
                </div>
                <div class={styles.MissingFontsUpload}>
                    <div>Add your font files here:</div>
                    <input
                        type="file"
                        multiple
                        accept=".ttf, .ttc, .otf, .otc"
                        onChange={handleMissingFontInputChange}
                    />
                </div>
                <div class={styles.MissingFontsText} style={{ padding: '30px 10px 0' }}>
                    Then map them in the table here:
                </div>
                <table class={styles.MissingFontsTable}>
                    <colgroup>
                        <col style="width: 20%" />
                        <col style="width: 20%" />
                        <col style="width: 20%" />
                        <col style="width: 20%" />
                        <col style="width: 20%" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th>Font Family</th>
                            <th>Weights</th>
                            <th>Style</th>
                            <th>Subsets</th>
                            <th>File</th>
                        </tr>
                    </thead>
                </table>
                <div class={styles.ScrollableTable}>
                    <table>
                        <colgroup>
                            <col style="width: 20%" />
                            <col style="width: 20%" />
                            <col style="width: 20%" />
                            <col style="width: 20%" />
                            <col style="width: 20%" />
                        </colgroup>
                        <tbody>
                            {Object.entries(missingFonts()).map(([family, weights]) => {
                                return Object.entries(weights).map(([weight, styles]) => {
                                    return Object.entries(styles).map(([style, { subsets, fontName }]) => {
                                        return Object.keys(subsets).map((subset) => {
                                            return (
                                                <tr>
                                                    <td>{fontName}</td>
                                                    <td>{weight}</td>
                                                    <td>{style}</td>
                                                    <td>{subset}</td>
                                                    <td>
                                                        <select name={`${family}_${weight}_${style}_${subset}`}>
                                                            <option value="">-- Select a font file --</option>
                                                            <option value="noto">Noto Sans</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            );
                                        });
                                    });
                                });
                            })}
                        </tbody>
                    </table>
                </div>
                <div class={styles.MissingFontsTextSub}>
                    If you don't want to add the missing fonts, we'll export Noto Sans as a fallback.
                </div>
                <div class={styles.TableFooter}>
                    <button class={styles.FooterButton} onClick={handleSelectedFontsClick}>
                        Export with selected fonts
                    </button>
                    <button
                        class={`${styles.FooterButton} ${styles.FooterButtonRed}`}
                        onClick={handleContinueWithFallback}
                    >
                        Export with fallback
                    </button>
                </div>
            </Show>
            <Toaster position="bottom-center" />
        </div>
    );
};

export default App;
