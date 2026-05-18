declare module "heic-convert" {
  type ConvertOptions = {
    buffer: ArrayBuffer | Buffer;
    format: "JPEG" | "PNG";
    quality?: number;
  };

  type ConvertAllImage = {
    convert: () => Promise<ArrayBuffer>;
  };

  function convert(options: ConvertOptions): Promise<ArrayBuffer>;
  namespace convert {
    function all(options: ConvertOptions): Promise<ConvertAllImage[]>;
  }

  export default convert;
}
